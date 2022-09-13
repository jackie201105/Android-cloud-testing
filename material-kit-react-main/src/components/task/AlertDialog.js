/**
* File name: AlertDialog.js
* Author: HongMing
* Component: Alert Dialog
* Function: used to display message
*/

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Typography
} from '@material-ui/core';
import PropTypes from 'prop-types';

const AlertDialog = ({
  open, handleClose, message, isError
}) => (
  <Dialog
    open={open}
    onClose={handleClose}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle id="alert-dialog-title" disableTypography>
      <Typography color="secondary" variant="h3">
        {isError ? 'Error' : 'Successful'}
      </Typography>
    </DialogTitle>
    <Divider />
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        {message}
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClose} color="primary">
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

AlertDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
  isError: PropTypes.bool.isRequired
};

export default AlertDialog;
