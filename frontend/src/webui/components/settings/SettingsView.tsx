import React, { useState } from 'react';
import { Card, CardContent, Typography, Switch, FormControlLabel, TextField, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import axios from 'axios';

const useStyles = makeStyles({
	card: {
		margin: '20px auto',
		maxWidth: '600px',
		padding: '20px',
		borderRadius: '12px',
		boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
	},
});

const SettingsView: React.FC = () => {
	const classes = useStyles();
	const [apiKey, setApiKey] = useState('');
	const [baseUrl, setBaseUrl] = useState('');
	const [model, setModel] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		try {
			const response = await axios.post('/api/settings', {
				apiKey,
				baseUrl,
				model,
			});
			console.log('Settings updated:', response.data);
		} catch (err) {
			setError('Failed to update settings. Please try again.');
			console.error('Error updating settings:', err);
		}
	};

	return (
		<div className="settings-container">
			<Card className={classes.card}>
				<CardContent>
					<Typography variant="h5" gutterBottom>
						Modern Settings
					</Typography>
					<form onSubmit={handleSubmit}>
						<TextField
							label="API Key"
							variant="outlined"
							fullWidth
							margin="normal"
							value={apiKey}
							onChange={(e) => setApiKey(e.target.value)}
						/>
						<TextField
							label="Custom Base URL"
							variant="outlined"
							fullWidth
							margin="normal"
							value={baseUrl}
							onChange={(e) => setBaseUrl(e.target.value)}
						/>
						<TextField
							label="Model"
							variant="outlined"
							fullWidth
							margin="normal"
							value={model}
							onChange={(e) => setModel(e.target.value)}
						/>
						<FormControlLabel
							control={<Switch color="primary" />}
							label="Enable Feature X"
						/>
						<FormControlLabel
							control={<Switch color="primary" />}
							label="Enable Tool Y"
						/>
						<Button type="submit" variant="contained" color="primary">
							Save Settings
						</Button>
					</form>
					{error && (
						<Typography color="error" variant="body2">
							{error}
						</Typography>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default SettingsView;
