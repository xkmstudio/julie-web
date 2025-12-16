import React, { useEffect, useState } from 'react';
import { useClient } from 'sanity';
import { set } from 'sanity';
import { v4 as uuidv4 } from 'uuid';
import { Card, Stack, Text, TextInput, Flex, Box, Label, Spinner } from '@sanity/ui';

const CustomVideoInput = ({ value = {}, onChange }) => {
    const client = useClient();
    const [videoUrl, setVideoUrl] = useState(value.video || '');
    const [isProcessing, setProcessing] = useState(false);
    const [poster, setPoster] = useState(value.poster || null);

    useEffect(() => {
        if (videoUrl) {
            generatePoster(videoUrl);
        }
    }, [videoUrl]);

    const generatePoster = async (url) => {
        if (isProcessing) return;
        setProcessing(true);

        try {
            const video = document.createElement('video');
            video.crossOrigin = 'anonymous';
            video.src = url;
            video.muted = true;
            video.playsInline = true;

            video.addEventListener('loadeddata', async () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');

                video.currentTime = 0;
                video.play();

                video.addEventListener('seeked', async () => {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                    canvas.toBlob(async (blob) => {
                        if (!blob) {
                            setProcessing(false);
                            return;
                        }

                        const file = new File([blob], 'poster.jpg', { type: 'image/jpeg' });

                        // Upload image to Sanity
                        const asset = await client.assets.upload('image', file, {
                            filename: 'poster.jpg',
                        });

                        // Ensure correct _type and _key for video object
                        const newValue = {
                            _key: value._key || uuidv4(),
                            _type: 'video',
                            video: url,
                            poster: { _type: 'image', asset: { _ref: asset._id }, _key: uuidv4() }
                        };

                        onChange(set(newValue));
                        setPoster(asset.url);
                        setProcessing(false);
                    }, 'image/jpeg');
                });

                video.pause();
            });
        } catch (error) {
            console.error('Error generating poster:', error);
            setProcessing(false);
        }
    };

    return (
        <Card padding={4} radius={2} shadow={1} style={{ backgroundColor: '#fff' }}>
            <Stack space={3}>
                {/* Video URL Input */}
                <Box>
                    <Label style={{ marginBottom: '15px' }} size={1}>Video URL</Label>
                    <TextInput
                        fontSize={2}
                        padding={3}
                        radius={2}
                        value={videoUrl}
                        placeholder="Paste direct Vimeo URL"

                        onChange={(e) => {
                            const newUrl = e.target.value;
                            setVideoUrl(newUrl);
                            onChange(set({
                                _key: value._key || uuidv4(),
                                _type: 'video',
                                video: newUrl,
                                poster
                            }));
                        }}
                    />
                </Box>

                {/* Loading State */}
                {isProcessing && (
                    <Flex align="center" justify="center">
                        <Spinner muted />
                        <Text size={1} muted>Generating poster...</Text>
                    </Flex>
                )}

                {/* Poster Preview */}
                {poster && (
                    <Box marginTop={3}>
                        <Label size={1}>Poster Preview</Label>
                        <Card radius={2} overflow="hidden" shadow={1} style={{ maxWidth: '100%', textAlign: 'center', marginTop: '15px' }}>
                            <img
                                src={poster.asset ? poster.asset.url : poster}
                                alt="Generated poster"
                                style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                        </Card>
                    </Box>
                )}
            </Stack>
        </Card>
    );
};

export default CustomVideoInput;
