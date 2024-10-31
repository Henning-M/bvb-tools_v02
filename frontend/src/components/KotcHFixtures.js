import React, { useState, useEffect } from 'react';
import KotcHFScoreEntry from './KotcHFScoreEntry';
import '../styles/KotcHFixtures.css';

function KotcHFixtures() {

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [rounds, setRounds] = useState([]);

  // Fetch distinct rounds from the fixtures table
  useEffect(() => {
    const fetchRounds = async () => {
        try {
            const response = await fetch('https://backend-service-255195242316.us-central1.run.app/fixtures/rounds');
            const data = await response.json();
            setRounds(data); // Set the rounds state with fetched data
        } catch (error) {
            console.error('Error fetching rounds:', error);
        }
    };
    fetchRounds();
    }, []);

    const handleClick = (index) => {
        setSelectedIndex(index);
    };

  return (
    <div className="kotchfixtures-container">
    <div className="kotchfixtures-roundnav">
                <ul>
                    {rounds.map((round, index) => (
                        <li 
                            key={round.round} 
                            className={selectedIndex === index ? 'selected' : ''}
                            onClick={() => handleClick(index)}
                        >
                            Round {round.round} {/* Display the round number */}
                        </li>
                    ))}
                </ul>
            </div>
        <div className="kotchfixtures-roundbody">
            <KotcHFScoreEntry selectedIndex={selectedIndex}/>
        </div>
        <div className="kotchfixtures-roundfooter"></div>
    </div>
);
}
  

export default KotcHFixtures;
