import React from 'react';
import { Button, makeStyles } from '@material-ui/core';

type ButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  children: any;
};

const useStyles = makeStyles(() => ({
  root: {
    borderRadius: 8,
  },
}));

const RoundedButtonComponent: React.FC<ButtonProps> = ({ onClick, disabled, children }) => {
  const classes = useStyles();

  return (
    <Button variant="contained" color="primary" onClick={onClick} disabled={disabled} className={classes.root}>
        {children}
    </Button>
  );
};

export default RoundedButtonComponent;
