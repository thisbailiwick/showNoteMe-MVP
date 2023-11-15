import React, { useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { json } from '@remix-run/node';

export async function loader() {
	return json({});
}

const jsonData = {
	'title': 'This is the title',
	'audioFile': 'https://download.samplelib.com/mp3/sample-15s.mp3',
	'annotations': [
		{ 'title': 'Annotation Title 1', 'start': 0, 'end': 10, 'content': 'Annotation Content 1' },
		{ 'title': 'Annotation Title 2', 'start': 10, 'end': 15, 'content': 'Annotation Content 2' },
		{ 'title': 'Annotation Title 3', 'start': 12, 'end': 20, 'content': 'Annotation Content 3' }
	]
};

const AudioPlayer = () => {
	const [highlightedAnnotation, setHighlightedAnnotation] = useState(null);
	const [annotations, setAnnotations] = useState([]);
	const sound = useRef(null); // Using useRef for the Howl instance

	useEffect(() => {
		sound.current = new Howl({
			src: [jsonData.audioFile],
			html5: true
		});
				trackAnnotations()
	}, []);

	const trackAnnotations = () => {
		setInterval(() => {
			if (sound.current) {
				const currentTime = sound.current.seek();
				const activeAnnotations = jsonData.annotations.filter(annotation =>
					currentTime >= annotation.start && currentTime <= annotation.end
				);

				//reverse the order so annotations starting later are on top
				activeAnnotations.sort((a, b) => b.start - a.start);

				if (highlightedAnnotation && (currentTime < highlightedAnnotation.start || currentTime > highlightedAnnotation.end)) {
					setHighlightedAnnotation(null);
				}

				setAnnotations(activeAnnotations);
			}
		}, 500);
	};
	const seekToAnnotation = (startTime) => {
		if (sound.current) {
			sound.current.seek(startTime);
			const clickedAnnotation = jsonData.annotations.find(ann => ann.start === startTime);
			setHighlightedAnnotation(clickedAnnotation);

			const activeAnnotations = jsonData.annotations.filter(ann =>
				ann.start <= startTime && ann.end >= startTime
			);
			setAnnotations(activeAnnotations);
		}
	};

	return (
		<div>
			<h1>{jsonData.title}</h1>
			<button onClick={() => sound.current.play()}>Play</button>
			<button onClick={() => sound.current.pause()}>Pause</button>
			{jsonData.annotations.map((annotation, index) => (
				<button key={index} onClick={() => seekToAnnotation(annotation.start)}>
					{annotation.title}
				</button>
			))}
			{annotations.map((annotation, index) => (
				<div key={index} className={annotation === highlightedAnnotation ? 'highlight' : ''} style={{ zIndex: index }}>
					<h3>{annotation.title}</h3>
					<p>{annotation.content}</p>
				</div>
			))}

		</div>
	);
};

export default AudioPlayer;
