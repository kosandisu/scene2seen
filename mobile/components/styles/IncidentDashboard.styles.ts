import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000000',
    },
    sheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: '100%',
        backgroundColor: '#F9FAFB',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 16,
        overflow: 'hidden',
    },
    handleContainer: {
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 8,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    handle: {
        height: 5,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
    },
    collapsedHeader: {
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 4,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    badge: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    expandedHeader: {
        paddingHorizontal: 20,
        paddingTop: 4,
        paddingBottom: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    expandedTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    expandedTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
    },
    countPill: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    countText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#3B82F6',
    },
    listContent: {
        paddingTop: 12,
        flexGrow: 1,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 20,
    },
});
