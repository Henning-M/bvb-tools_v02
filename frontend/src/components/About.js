import React from 'react';
import Navigation from './Navigation';
import '../styles/About.css';

const About = () => {
    return (
        <div>
            <Navigation />
            <div className="about-container">
                <h1>What is this thing?</h1>
                <div className="about-faq">
                    <div className="about-faq-item">
                        <h2 className="about-faq-question">What is 'King-of-the-Court'?</h2>
                        <p className="about-faq-answer">
                            <ul>
                                <li>The court sides are named: one side is the 'Challenger' side, the other one the 'King' side</li>
                                <li>There is one team on the king side (do a draw before playing). All other teams 
                                    queue up behind the baseline of the challenger side
                                </li>
                                <li>The team on the challenger side always serves, but only the team on the king side can make points</li>
                                <li>If the challenger team makes the point ('break'), they move to the king side for the next rally. 
                                    The team that lost the point (on the king side) moves over to the challenger side queue
                                </li>
                                <li>If the king side makes the point ('sideout'), this team gets +1 point. To keep scores 
                                    transparent for all teams, the king side team have to shout out their current score after every 
                                    point they make
                                </li>
                                <li>On the challenger side, teams take turns serving</li>
                                <li>The game is time-boxed (e.g. 10 minutes). When the time is up, the team with the most points won</li>
                                <li>Important: Service errors do NOT count as a point for the king side team. The game just continues
                                     with the next challenger side team serving.
                                </li>
                                <li>Eitquette: since time is critical (especially for teams with few points), players should never 
                                    deliberately delay the game, e.g. by taking a long time to serve. The team losing the rally should 
                                    further always recover the ball immediately after the rally, so no time is lost fetching it
                                </li>
                                {/* <li>Create English version of this: https://www.volleyball-verband.de/de/redaktion/2021/august/beach--regeln-king-of-the-court/</li> */}
                            </ul>
                        </p>
                    </div>
                    <div className="about-faq-item">
                        <h2 className="about-faq-question">How does the KOTC Schedule Creator create a schedule?</h2>
                        <p className="about-faq-answer">
                            <ul>
                                <li>Takes three parameters to create a schedule
                                    <ul>
                                        <li># of teams: fetched automatically from the list of registered teams</li>
                                        <li># of groups: can be configured; groups are meant to play in parallel, so this can e.g. be used to represent the # of courts available</li>
                                        <li># of rounds: can be configured; define how many (usually time-boxed) rounds of KOTC shall be played</li>
                                    </ul>
                                </li>
                                <li>Tool creates a random schedule across groups and rounds with a set number of teams</li>
                                <li>Uses constraints to optimize the randomization. Key constraints are:
                                    <ul>
                                        <li>Constraint 1: minimize duplicate matchups → groups are created in a way to minimize the chance of playing the same teams again</li>
                                        <li>Constraint 2: if groups are note same-sized, groups should be created in a way so every team plays in the odd-sized group for the same amount of rounds → example if group size is 5-5-4, no team should be playing in the 4 team group all the time</li>
                                    </ul>
                                </li>
                                <li>Algorithm was created by ChatGPT by feeding it with these requirements and fine-tuning through multiple iterations</li>
                                <li>Quality of the results (are the constraints incorporated properly etc.) was evaluated on a small sample: I ran the algorithm a few times with different settings for the parameters and checked if it looks good → anybody questioning the accuracy of the output is invited to refine the algorithm</li>
                            </ul>
                        </p>
                    </div>
                    <div className="about-faq-item">
                        <h2 className="about-faq-question">What are 'calibrated points'?</h2>
                        <p className="about-faq-answer">
                            <ul>
                                <li>Depending on the amount of teams, it can not be guaranteed that all groups (courts) have 
                                the same size (amount of teams)</li>
                                <li>Since rounds are time-boxed and all groups play for the same amount of time, 
                                teams in the smaller groups have an unfair advantage because they have more opportunities to make points</li>
                                <li>Example: 7 teams, so groupA has 4, groupB 3 teams; since there are always two teams on the 
                                    court (one challenger, one king), in groupB, only one team is waiting and will play at least every other 
                                    rally. In groupA, there are always two teams waiting and as a challenger, each waiting team has to wait 
                                    two rallys until it's their turn again.</li>
                                <li>This inbalance can be corrected by calibrating points for group size (for every team and round)</li>
                                <li>The calibrated points for each team in a round are calculated as follows: RegularPoints * (n / nMax)</li>
                                <li>nMax is the number of teams in the biggest group and n is the number of teams in the 
                                    group that this team played in
                                </li>
                            </ul>
                        </p>
                    </div>
                    {/* <div className="about-faq-item">
                        <h2 className="about-faq-question">Where can I find more information?</h2>
                        <p className="about-faq-answer">Additional information can be found in the documentation section of our website.</p>
                    </div> */}                    
                </div>
            </div>
        </div>
    );
    
};

export default About;
