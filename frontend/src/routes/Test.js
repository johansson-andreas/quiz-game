import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

const Test = () => {
    // State variables for form data
    const [fråga, setFråga] = useState('');
    const [svar, setsvar] = useState({ svar1: '', svar2: '', svar3: '' });
    const [rättSvar, setRättSvar] = useState('');
    const [kategorier, setKategorier] = useState('');
    const [quizData, setQuizData] = useState([]);

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Process categories and create new question object
        const kategorierArray = kategorier.split(',').map(kategori => kategori.trim());
        const newQuestion = {
            fråga,
            svar: Object.values(svar),
            rättSvar,
            kategorier: kategorierArray
        };

        // Update quiz data and reset form
        setQuizData([...quizData, newQuestion]);
        console.log('Quiz Data Submitted', newQuestion);
        resetForm();
    };

    // Reset form fields
    const resetForm = () => {   
        setFråga('');
        setsvar({ svar1: '', svar2: '', svar3: '' });
        setRättSvar('');
        setKategorier('');
    };

    return (
        <div style={{ display: 'block', width: 700, padding: 30 }}>
            <h4>Quiz Game Form</h4>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Fråga:</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter the question"
                        value={fråga}
                        onChange={(e) => setFråga(e.target.value)}
                    />
                </Form.Group>

                {['svar1', 'svar2', 'svar3'].map((key, index) => (
                    <Form.Group key={key} className="mb-3">
                        <Form.Label>{`Svar ${index + 1}:`}</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder={`Enter answer ${index + 1}`}
                            value={svar[key]}
                            onChange={(e) => setsvar({ ...svar, [key]: e.target.value })}
                        />
                    </Form.Group>
                ))}

                <Form.Group className="mb-3">
                    <Form.Label>Rätt svar:</Form.Label>
                    {Object.keys(svar).map((key, index) => (
                        <Form.Check
                            key={key}
                            type="radio"
                            id={`correctAnswer${index + 1}`}
                            label={`Svar ${index + 1}`}
                            value={svar[key]}
                            checked={rättSvar === svar[key]}
                            onChange={(e) => setRättSvar(e.target.value)}
                            disabled={!svar[key]} 
                        />
                    ))}
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Kategorier:</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter categories separated by commas"
                        value={kategorier}
                        onChange={(e) => setKategorier(e.target.value)}
                    />
                </Form.Group>

                <Button variant="primary" type="submit">
                    Skicka
                </Button>
            </Form>

            {quizData.length > 0 && (
                <div className="mt-4">
                    <h5>Quiz Data</h5>
                    <ul>
                        {quizData.map((item, index) => (
                            <li key={index}>
                                <strong>Fråga:</strong> {item.fråga}<br />
                                <strong>Svar:</strong> {item.svar.join(', ')}<br />
                                <strong>Rätt Svar:</strong> {item.rättSvar}<br />
                                <strong>Kategorier:</strong> {item.kategorier.join(', ')}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Test;
