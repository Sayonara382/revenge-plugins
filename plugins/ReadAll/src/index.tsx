import { ReactNative } from '@vendetta/metro/common';
import { Forms } from '@vendetta/ui/components';
import { findByProps, findByStoreName } from '@vendetta/metro';
import { showToast } from '@vendetta/ui/toasts';
import { getAssetIDByName } from '@vendetta/ui/assets';
import { storage } from '@vendetta/plugin';
import { useProxy } from '@vendetta/storage';

const { FormSection, FormRow, FormSwitch } = Forms;

storage.markGuilds ??= true;
storage.markPrivate ??= false;

const GuildStore = findByStoreName('GuildStore');
const ChannelStore = findByProps('getChannel', 'getMutablePrivateChannels');
const ReadStateStore = findByProps('getUnreadCount', 'hasUnread');
const ReadStateActions = findByProps('markGuildAsRead', 'markChannelAsRead');

const markAllAsRead = () => {
    if (storage.markGuilds) {
        const guilds = Object.values(GuildStore.getGuilds()) as Array<{ id: string }>;
        for (const guild of guilds) {
            if (ReadStateStore.hasUnread(guild.id)) {
                ReadStateActions.markGuildAsRead(guild.id);
            }
        }
    }
    if (storage.markPrivate) {
        const privateChannels = Object.values(ChannelStore.getMutablePrivateChannels()) as Array<{ id: string }>;
        for (const channel of privateChannels) {
            if (ReadStateStore.hasUnread(channel.id)) {
                ReadStateActions.markChannelAsRead(channel.id);
            }
        }
    }
    showToast('All channels marked as read!', getAssetIDByName('Check'));
};

const MarkAllAsReadButton = () => {
    const { Text, TouchableOpacity } = ReactNative;
    return (
        <TouchableOpacity
            onPress={markAllAsRead}
            style={{
                backgroundColor: '#5865f2',
                padding: 12,
                margin: 8,
                borderRadius: 8,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center'
            }}
            activeOpacity={0.7}
        >
            <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600', textAlign: 'center' }}>
                Mark All as Read
            </Text>
        </TouchableOpacity>
    );
};

export const settings = () => {
    useProxy(storage);
    const { View } = ReactNative;
    return (
        <ReactNative.ScrollView>
            <FormSection title="Mark Options">
                <FormRow
                    label="Mark Guild Channels"
                    subLabel="Mark all unread channels in servers as read"
                    leading={<FormRow.Icon source={getAssetIDByName('ic_group_24px')} />}
                    trailing={
                        <FormSwitch
                            value={storage.markGuilds}
                            onValueChange={(value: boolean) => (storage.markGuilds = value)}
                        />
                    }
                />
                <FormRow
                    label="Mark Private Channels"
                    subLabel="Mark all unread DMs and group chats as read"
                    leading={<FormRow.Icon source={getAssetIDByName('ic_message_24px')} />}
                    trailing={
                        <FormSwitch
                            value={storage.markPrivate}
                            onValueChange={(value: boolean) => (storage.markPrivate = value)}
                        />
                    }
                />
            </FormSection>

            <FormSection title="Action">
                <View style={{ padding: 16 }}>
                    <MarkAllAsReadButton />
                </View>
            </FormSection>
        </ReactNative.ScrollView>
    );
};
