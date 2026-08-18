
import { supabase } from './supabaseClient';
import { Message, Notification } from '../types';

export const communicationService = {
    // --- CHAT MESSAGES ---

    sendMessage: async (senderId: string, receiverId: string, content: string): Promise<void> => {
        console.log('=== SENDING MESSAGE ===');
        console.log('From (sender_id):', senderId);
        console.log('To (receiver_id):', receiverId);
        console.log('Content:', content);

        const newMessage = {
            sender_id: senderId,
            receiver_id: receiverId,
            content,
            is_read: false
        };

        const { data, error } = await supabase.from('messages').insert([newMessage]).select();
        if (error) {
            console.error('MESSAGE SEND ERROR:', error);
            throw new Error(`Xabar yuborishda xatolik: ${error.message}`);
        }
        console.log('MESSAGE SENT SUCCESSFULLY:', data);

        // Bildirishnoma yaratish
        await communicationService.sendNotification(receiverId, 'message', `Sizga yangi xabar keldi`, newMessage.sender_id);
    },

    getMessages: async (userId: string, contactId: string): Promise<Message[]> => {
        console.log('=== FETCHING MESSAGES ===');
        console.log('userId:', userId, 'contactId:', contactId);

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${userId},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${userId})`)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('FETCH MESSAGES ERROR:', error);
            return [];
        }
        console.log('MESSAGES FETCHED:', data?.length, 'messages found');
        if (data && data.length > 0) {
            console.log('Last message:', data[data.length - 1]);
        }
        return data || [];
    },

    markMessagesAsRead: async (userId: string, targetId: string): Promise<void> => {
        await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('receiver_id', userId)
            .eq('sender_id', targetId);
    },

    getUnreadMessageCount: async (userId: string): Promise<number> => {
        const { count, error } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', userId)
            .eq('is_read', false);
        return error ? 0 : count || 0;
    },

    // --- NOTIFICATIONS ---

    sendNotification: async (userId: string, type: 'message' | 'comment' | 'alert', message: string, linkId?: string): Promise<void> => {
        const newNotif = {
            user_id: userId,
            type,
            message,
            link_id: linkId,
            is_read: false
        };
        await supabase.from('notifications').insert([newNotif]);
    },

    getNotifications: async (userId: string): Promise<Notification[]> => {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
        return data || [];
    },

    markNotificationAsRead: async (notificationId: string): Promise<void> => {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);
    },

    // --- REAL-TIME SUBSCRIPTIONS ---

    subscribeToMessages: (userId: string, callback: () => void) => {
        console.log(`Subscribing to ALL messages for Realtime sync...`);
        const channel = supabase
            .channel('messages-channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages'
                },
                (payload) => {
                    console.log('Realtime Message received:', payload);
                    const msg = payload.new as any;
                    // Agar xabar ushbu foydalanuvchiga tegishli bo'lsa (yuborgan yoki qabul qilgan)
                    if (msg && (msg.receiver_id === userId || msg.sender_id === userId)) {
                        callback();
                    }
                }
            )
            .subscribe((status) => {
                console.log('Realtime Subscription Status:', status);
            });
        return channel;
    },

    subscribeToNotifications: (userId: string, callback: () => void) => {
        console.log(`Subscribing to notifications for user: ${userId}`);
        const channel = supabase
            .channel(`user-notifications-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications'
                },
                (payload) => {
                    console.log('Realtime Notification Payload received:', payload);
                    const notif = payload.new as any;
                    if (notif && notif.user_id === userId) {
                        callback();
                    }
                }
            )
            .subscribe((status) => {
                console.log(`Realtime Notification Subscription status for ${userId}:`, status);
            });
        return channel;
    },

    // --- DOCTOR COMMENT ---

    addDoctorComment: async (analysisId: string, comment: string, patientEmail: string): Promise<void> => {
        // Fetch analysis info first to include in notification
        const { data: analysis } = await supabase.from('histories').select('summary, type').eq('id', analysisId).single();

        const { error } = await supabase.from('histories').update({ doctor_comment: comment }).eq('id', analysisId);
        if (error) throw new Error(`Izoh qoldirishda xatolik: ${error.message}`);

        const analysisInfo = analysis ? ` [${analysis.type === 'uzi' ? 'UZI' : analysis.type === 'diabetes' ? 'Diabet' : 'O\'pka'}: ${analysis.summary.substring(0, 30)}...]` : '';

        // Send notification to patient
        await communicationService.sendNotification(
            patientEmail,
            'comment',
            `Shifokor tahlilingizga izoh qoldirdi${analysisInfo}`,
            analysisId
        );
    }
};
