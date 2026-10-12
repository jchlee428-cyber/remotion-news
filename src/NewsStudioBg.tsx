import React from 'react';
import {CanvasImage, staticFile} from 'remotion';

export const NewsStudioBg: React.FC = () => {
	return (
		<CanvasImage
			src={staticFile("news_studio_bg.jpg")}
			durationInFrames={90}
		/>
	);
};
