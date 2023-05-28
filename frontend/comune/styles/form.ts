import { makeStyles } from '@material-ui/core/styles';

export const useFormStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        padding: theme.spacing(2),
    },
        paper: {
            padding: theme.spacing(2),
            margin: '50px',
            textAlign: 'center',
            color: theme.palette.text.secondary,
        },
    form: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        '& .MuiTextField-root': {
            margin: theme.spacing(1),
            width: '100%',
        },
    },
    button: {
        marginTop: theme.spacing(1),
        width: '50%',
    },
    projectImage : {
        width: '50%',
    }
}));
