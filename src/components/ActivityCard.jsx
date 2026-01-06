import React from 'react';
import './ActivityCard.css'; // Assuming you have some CSS file for styling

function ActivityCard({ activity, participants }) {
	return (
		<div className="activity-card">
			{/* Existing activity details rendering */}

			{/* Participants section */}
			{participants && participants.length > 0 && (
				<div className="activity-card__participants">
					<h4 className="activity-card__participants-title">Participants</h4>
					<ul className="participants-list">
						{participants.map(p => (
							<li key={p.id ?? p.name} className="participant">
								{p.avatarUrl ? (
									<img className="participant__avatar" src={p.avatarUrl} alt={p.name} />
								) : (
									<div className="participant__avatar participant__avatar--initials">
										{getInitials(p.name)}
									</div>
								)}
								<span className="participant__name">{p.name}</span>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}

// helper: get initials from a name
function getInitials(name = '') {
	// simple, safe initials extraction
	return name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map(part => part[0].toUpperCase())
		.join('');
}

export default ActivityCard;