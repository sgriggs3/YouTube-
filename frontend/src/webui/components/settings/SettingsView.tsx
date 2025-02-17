import React from 'react';
import { Card, CardContent, Typography, Switch, FormControlLabel } from '@mui/material';
import { makeStyles } from '@mui/styles';

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
	return (
		<div className= "settings-container" >
		<Card className={ classes.card }>
			<CardContent>
			<Typography variant="h5" gutterBottom >
				Modern Settings
					</Typography>
					< FormControlLabel
	control = {< Switch color = "primary" />}
label = "Enable Feature X"
	/>
	<FormControlLabel 
            control={ <Switch color="primary" />}
label = "Enable Tool Y"
	/>
	</CardContent>
	</Card>
	</div>
  );
};

export default SettingsView;
