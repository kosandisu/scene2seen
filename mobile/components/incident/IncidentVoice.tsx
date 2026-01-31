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
    onSeek
}: {
    progress: number;
    onSeek: (percent: number) => void;
}) => {
    // 1. Generate random "voice-like" bar heights once
    const bars = useMemo(() => {
        return Array.from({ length: 40 }).map(() =>
            Math.max(30, Math.random() * 100) // Minimum 30% height, max 100%
        );
    }, []);

    const [width, setWidth] = useState(0);

    // 2. Handle touch/drag to seek
    const handleTouch = (evt: GestureResponderEvent) => {
        if (width > 0) {
            const locX = evt.nativeEvent.locationX;
            const percent = Math.max(0, Math.min(1, locX / width));
            onSeek(percent);
        }
    };

    return (
        <View
            style={{
                flex: 1,
                height: 30, // Fixed height for the bars container
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginHorizontal: 8
            }}
            onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
            // Simple touch handler (for tap)
            onTouchStart={handleTouch}
            // Simple drag handler (for slide)
            onTouchMove={handleTouch}
        >
            {bars.map((heightPercent, index) => {
                const barProgress = index / bars.length;
                // If current bar is "before" the progress point, it's active
                const isActive = barProgress < progress;

                return (
                    <View
                        key={index}
                        style={{
                            width: 3, // Fixed width bars
                            height: `${heightPercent}%`,
                            backgroundColor: isActive ? '#3B82F6' : '#D1D5DB', // Blue vs Gray
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
            }, 100); // 100ms for smoother visual updates
        } else {
            // Even if paused, update duration if we have it
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

            // If we seek while paused, stay paused. If playing, keep playing.
            // But we might want to ensure 'isDragging' logic doesn't block the update.
            // Since this is a direct seek, we update position immediately.
        }
    };

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return '00:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <View style={styles.voicePlayerBubble}>
            <Pressable onPress={togglePlayback} style={styles.playButtonCircle}>
                <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={20}
                    color="#3B82F6"
                    style={{ marginLeft: isPlaying ? 0 : 2 }}
                />
            </Pressable>

            <View style={{ flex: 1, paddingLeft: 8 }}>
                {/* Waveform Visualization */}
                <Waveform
                    progress={duration > 0 ? position / duration : 0}
                    onSeek={handleSeek}
                />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                    <Text style={styles.voiceTimerText}>{formatTime(position)}</Text>
                    <Text style={styles.voiceTimerText}>{formatTime(duration)}</Text>
                </View>
            </View>
        </View>
    );
};
