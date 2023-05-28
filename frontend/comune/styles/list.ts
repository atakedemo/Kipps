import { makeStyles } from '@material-ui/core/styles';

export const useProjectListStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    margin: theme.spacing(2),
    width: '100%',
    color: '#e7e8e8',
  },
  project: {
    margin: theme.spacing(2),
    padding: theme.spacing(2),
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: theme.shape.borderRadius,
  },
  projectImage: {
    width: '80%',
    objectFit: 'cover',
    marginBottom: theme.spacing(2),
  },
  button: {
    margin: theme.spacing(1),
  },
  filter: {
    marginBottom: theme.spacing(2),
    color: '#e7e8e8',
  },
}));
