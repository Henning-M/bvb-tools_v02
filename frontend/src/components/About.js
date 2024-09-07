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
                        <h2 className="about-faq-question">How does the KOTC Schedule Creator work?</h2>
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
                    {/* <div className="about-faq-item">
                        <h2 className="about-faq-question">How can I use this application?</h2>
                        <p className="about-faq-answer">You can use this application by following the instructions provided in the user guide.</p>
                    </div>
                    <div className="about-faq-item">
                        <h2 className="about-faq-question">Where can I find more information?</h2>
                        <p className="about-faq-answer">Additional information can be found in the documentation section of our website.</p>
                    </div> */}
                    {/* Add more FAQ items as needed */}
                </div>
            </div>
        </div>
    );
    
};

export default About;
