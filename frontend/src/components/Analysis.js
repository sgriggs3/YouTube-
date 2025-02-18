// Import necessary libraries
import React, { useState } from 'react';
import { Button, Form, Modal, Dropdown, Input } from 'semantic-ui-react';

// Main Analysis component
const Analysis = () => {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [feedback, setFeedback] = useState('');

  // Options for advanced analysis
  const advancedOptions = [
    { key: 'opt1', text: 'Option 1', value: 'option1' },
    { key: 'opt2', text: 'Option 2', value: 'option2' },
    { key: 'opt3', text: 'Option 3', value: 'option3' },
  ];

  // Handle option selection
  const handleOptionChange = (e, { value }) => {
    setSelectedOption(value);
  };

  // Handle feedback change
  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
  };

  // Handle form submission
  const handleSubmitFeedback = () => {
    // Logic to handle feedback submission
    console.log('Feedback submitted:', feedback);
    setShowFeedbackForm(false);
  };

  return (
    <div className="analysis-container">
      <h1>Analysis Dashboard</h1>
      <Button onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}>
        {showAdvancedOptions ? 'Hide Advanced Options' : 'Show Advanced Options'}
      </Button>
      {showAdvancedOptions && (
        <Dropdown
          placeholder='Select Analysis Option'
          fluid
          selection
          options={advancedOptions}
          onChange={handleOptionChange}
          value={selectedOption}
        />
      )}
      <Button onClick={() => setShowFeedbackForm(true)}>Give Feedback</Button>
      <Modal open={showFeedbackForm} onClose={() => setShowFeedbackForm(false)}>
        <Modal.Header>Feedback Form</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field
              control={Input}
              label='Your Feedback'
              placeholder='Let us know your thoughts...'
              value={feedback}
              onChange={handleFeedbackChange}
            />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() => setShowFeedbackForm(false)}>Cancel</Button>
          <Button primary onClick={handleSubmitFeedback}>Submit</Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
};

export default Analysis;