//styling for incidentCallout
import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
    absoluteContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'flex-end',
        zIndex: 1000,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    callout: {
        // Width is set dynamically
    },
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        maxHeight: 700,
    },
    scrollView: {
        flexGrow: 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    headerLeft: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    incidentId: {
        fontSize: 14,
        fontWeight: '500',
        color: '#9CA3AF',
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    criticalBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    criticalBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    closeButton: {
        fontSize: 20,
        color: '#6B7280',
        fontWeight: '300',
        marginLeft: 8,
    },
    section: {
        marginBottom: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        marginLeft: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        color: '#374151',
    },
    urlText: {
        color: '#3B82F6',
    },
    detailsGrid: {
        marginTop: 8,
        marginBottom: 16,
    },
    gridRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 0,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        //flex: 1,
        width: '50%', // Default to half width
        marginBottom: 12,
        paddingRight: 8,
    },
    fullWidth: {
        width: '100%',
        //flex: 1,
        marginRight: 0,
        marginLeft: 0,
    },
    detailIcon: {
        marginRight: 8,
        marginTop: 2,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#9CA3AF',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '400',
        lineHeight: 22,
    },
    /* --- NEW STYLES FOR LINK PREVIEW --- */
    linkCard: {
        marginTop: 6,
        backgroundColor: '#F9FAFB', // Light grey background
        borderRadius: 8,
        flexDirection: 'row',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB', // Subtle border
    },
    linkCardStrip: {
        width: 4,
        backgroundColor: '#3B82F6', // The blue accent line on the left
    },
    linkCardContent: {
        padding: 10,
        flex: 1,
    },
    linkTitle: {
        fontSize: 13,
        fontWeight: '700', // Bold title
        color: '#1F2937',
        marginBottom: 4,
        lineHeight: 20,
    },
    linkDesc: {
        fontSize: 12,
        color: '#6B7280', // Greener text for description
        lineHeight: 18,
        marginBottom: 8,
    },
    linkFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    linkDomain: {
        fontSize: 10,
        fontWeight: '700',
        color: '#3B82F6', // Blue link color
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    arrow: {
        position: 'absolute',
        bottom: -10,
        left: '50%',
        marginLeft: -10,
        width: 0,
        height: 0,
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderTopWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#FFFFFF',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    appSourceCard: {
        marginTop: 6,
        backgroundColor: '#FFF7ED',
        borderRadius: 8,
        flexDirection: 'row',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#FDBA74',
    },
    appSourceStrip: {
        width: 4,
        backgroundColor: '#FF6B35',
    },
    appSourceContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 10,
    },
    appSourceText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#C2410C',
    },
    telegramStrip: {
        width: 4,
        backgroundColor: '#0088cc', // Telegram Blue
    },
    telegramBackground: {
        marginTop: 6,
        backgroundColor: '#F0F9FF', // Light blue tint
        borderRadius: 8,
        flexDirection: 'row',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#BAE6FD',
    },
    telegramText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#0369A1',
    },
    facebookStrip: {
        width: 4,
        backgroundColor: '#1877F2', // Facebook Blue
    },
    facebookBackground: {
        marginTop: 6,
        backgroundColor: '#F0F2F5', // Facebook Light Grey
        borderRadius: 8,
        flexDirection: 'row',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#CCD0D5',
    },
    twitterStrip: {
        width: 4,
        backgroundColor: '#333333', // X (Twitter) Dark Grey
    },
    twitterText: {
        color: '#888484ff',
    },
    voiceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        marginTop: 10,
        gap: 12,
        zIndex: 99,
        position: 'relative',
    },
    voicePlayerBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3B82F6', // Blue
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginTop: 10,
        zIndex: 99,
    },
    playButtonCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    voiceSliderContainer: {
        flex: 1,
    },
    voiceTimerText: {
        color: '#DBEAFE', // Light blue/white text
        fontSize: 11,
        fontWeight: '500',
        marginTop: -2,
        marginLeft: 4,
    },
});
