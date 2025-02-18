import React, { useState } from 'react';
import { Card, CardContent, Typography, Switch, FormControlLabel, TextField, Button, MenuItem, Select, InputLabel, FormControl, Link } from '@mui/material';
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
	const [provider, setProvider] = useState('');
	const [featureXEnabled, setFeatureXEnabled] = useState(false);
	const [toolYEnabled, setToolYEnabled] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		try {
			const response = await axios.post('/api/settings', {
				apiKey,
				baseUrl,
				model,
				provider,
				featureXEnabled,
				toolYEnabled,
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
						<FormControl fullWidth margin="normal">
							<InputLabel>API Provider</InputLabel>
							<Select
								value={provider}
								onChange={(e) => setProvider(e.target.value)}
								label="API Provider"
							>
								<MenuItem value="openrouter">OpenRouter</MenuItem>
								<MenuItem value="anthropic">Anthropic</MenuItem>
								<MenuItem value="google">Google Gemini</MenuItem>
								<MenuItem value="azure">Azure</MenuItem>
								<MenuItem value="aws">AWS</MenuItem>
							</Select>
						</FormControl>
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
							control={<Switch color="primary" checked={featureXEnabled} onChange={(e) => setFeatureXEnabled(e.target.checked)} />}
							label="Enable Feature X"
						/>
						<FormControlLabel
							control={<Switch color="primary" checked={toolYEnabled} onChange={(e) => setToolYEnabled(e.target.checked)} />}
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
					<Typography variant="body2" style={{ marginTop: '20px' }}>
						Need help? <Link href="https://example.com/get-api-key" target="_blank">Get your API key here</Link>
					</Typography>
				</CardContent>
			</Card>
		</div>
	);
};

export default SettingsView;
