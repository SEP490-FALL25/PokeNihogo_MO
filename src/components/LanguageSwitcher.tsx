import { useLanguage } from '@hooks/useLanguage';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LanguageSwitcherProps {
    showTitle?: boolean;
    compact?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
    showTitle = true, 
    compact = false 
}) => {
    const { changeLanguage, isEnglish, isVietnamese } = useLanguage();

    if (compact) {
        return (
            <View style={styles.compactContainer}>
                <TouchableOpacity
                    style={[
                        styles.compactButton,
                        isEnglish && styles.activeCompactButton
                    ]}
                    onPress={() => changeLanguage('en')}
                >
                    <Text style={[
                        styles.compactButtonText,
                        isEnglish && styles.activeCompactButtonText
                    ]}>
                        EN
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[
                        styles.compactButton,
                        isVietnamese && styles.activeCompactButton
                    ]}
                    onPress={() => changeLanguage('vi')}
                >
                    <Text style={[
                        styles.compactButtonText,
                        isVietnamese && styles.activeCompactButtonText
                    ]}>
                        VI
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {showTitle && <Text style={styles.title}>Ngôn ngữ / Language</Text>}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        isEnglish && styles.activeButton
                    ]}
                    onPress={() => changeLanguage('en')}
                >
                    <Text style={[
                        styles.buttonText,
                        isEnglish && styles.activeButtonText
                    ]}>
                        🇺🇸 English
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[
                        styles.button,
                        isVietnamese && styles.activeButton
                    ]}
                    onPress={() => changeLanguage('vi')}
                >
                    <Text style={[
                        styles.buttonText,
                        isVietnamese && styles.activeButtonText
                    ]}>
                        🇻🇳 Tiếng Việt
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        margin: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 15,
    },
    button: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#e0e0e0',
        borderWidth: 1,
        borderColor: '#ccc',
    },
    activeButton: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    buttonText: {
        fontSize: 16,
        color: '#333',
    },
    activeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    // Compact styles
    compactContainer: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 2,
    },
    compactButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: 'transparent',
    },
    activeCompactButton: {
        backgroundColor: '#007AFF',
    },
    compactButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
    },
    activeCompactButtonText: {
        color: '#fff',
    },
});

export default LanguageSwitcher;
