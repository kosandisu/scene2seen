import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#F3F4F6',
        width: '100%',
    },
    image: {
        width: '100%',
    },
    loadingOverlay: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E5E7EB',
    },
    errorContainer: {
        height: 150,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    errorText: {
        marginTop: 4,
        fontSize: 12,
        color: '#9CA3AF',
    },
});
