import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, GestureResponderEvent } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/IncidentCallout.styles';

interface IncidentVoiceProps {
    url: string;
}

const Waveform = ({
    progress,
    onSeek,
    onPanStateChange
}: {
    progress: number;
    onSeek: (percent: number) => void;
    onPanStateChange: (isActive: boolean) => void;
}) => {
    const bars = useMemo(() => {
        return Array.from({ length: 35 }).map(() =>
            Math.max(30, Math.random() * 100)
        );
    }, []);

    const [width, setWidth] = useState(0);

    const calculateProgress = (evt: GestureResponderEvent) => {
        if (width > 0) {
            const locX = evt.nativeEvent.locationX;
            return Math.max(0, Math.min(1, locX / width));
        }
        return 0;
    };

    const handleTouchStart = (evt: GestureResponderEvent) => {
        onPanStateChange(true);
        const percent = calculateProgress(evt);
        onSeek(percent);
    };

    const handleTouchMove = (evt: GestureResponderEvent) => {
        const percent = calculateProgress(evt);
        onSeek(percent);
    };

    const handleTouchEnd = () => {
        onPanStateChange(false);
    };

    return (
        <View
            style={{
                flex: 1,
                height: 45,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginHorizontal: 4
            }}
            onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
        >
            {bars.map((heightPercent, index) => {
                const barProgress = index / bars.length;
                const isActive = barProgress < progress;

                return (
                    <View
                        key={index}
                        style={{
                            width: 4,
                            height: `${heightPercent}%`,
                            // Blue (#2563EB) for listened/active, Light Grey for unlistened
                            backgroundColor: isActive ? '#2563EB' : '#D1D5DB',
                            borderRadius: 2,
                        }}
                    />
                );
            })}
        </View>
    );
};

export const IncidentVoice = ({ url }: IncidentVoiceProps) => {
    const player = useAudioPlayer(url);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        let interval: any;
        if (isPlaying) {
            interval = setInterval(() => {
                if (player.duration > 0 && duration !== player.duration) {
                    setDuration(player.duration);
                }

                if (!isDragging) {
                    setPosition(player.currentTime);
                }

                if (player.currentTime >= player.duration && player.duration > 0) {
                    setIsPlaying(false);
                    setPosition(player.duration);
                }
            }, 100);
        } else {
            if (player.duration > 0 && duration === 0) {
                setDuration(player.duration);
            }
        }

        return () => clearInterval(interval);
    }, [isPlaying, isDragging, duration, player]);

    const togglePlayback = () => {
        if (isPlaying) {
            player.pause();
            setIsPlaying(false);
        } else {
            if (duration > 0 && position >= duration - 0.5) {
                player.seekTo(0);
                setPosition(0);
            }
            player.play();
            setIsPlaying(true);
        }
    };

    const handleSeek = (percent: number) => {
        if (duration > 0) {
            const newTime = percent * duration;
            setPosition(newTime);
            player.seekTo(newTime);
        }
    };

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return '00:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const getDisplayTime = () => {
        if (duration === 0) return '0:00';
        if (position >= duration) return '0:00';
        const remaining = Math.max(0, duration - position);
        return formatTime(remaining);
    };

    return (
        <View style={[
            styles.voicePlayerBubble,
            {
                backgroundColor: '#F3F4F6',
                borderRadius: 8,
                paddingHorizontal: 0,
                paddingVertical: 0,
                overflow: 'hidden',
                justifyContent: 'space-between'
            }
        ]}>
            <View style={{ width: 4, height: '100%', backgroundColor: '#2563EB' }} />

            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12 }}>
                <Pressable
                    onPress={togglePlayback}
                    style={[
                        styles.playButtonCircle,
                        {
                            backgroundColor: '#2563EB', // Blue Circle
                            marginRight: 4
                        }
                    ]}
                >
                    <Ionicons
                        name={isPlaying ? "pause" : "play"}
                        size={20}
                        color="#FFFFFF"
                        style={{ marginLeft: isPlaying ? 0 : 2 }}
                    />
                </Pressable>

                {/* Waveform Visualization */}
                <View style={{ flex: 1, marginHorizontal: 0 }}>
                    <Waveform
                        progress={duration > 0 ? position / duration : 0}
                        onSeek={handleSeek}
                        onPanStateChange={setIsDragging}
                    />
                </View>

                <Text style={[
                    styles.voiceTimerText,
                    { color: '#2563EB', marginLeft: 8 }
                ]}>
                    {getDisplayTime()}
                </Text>
            </View>

            <View style={{ width: 4, height: '100%', backgroundColor: '#2563EB' }} />
        </View>
    );
};
