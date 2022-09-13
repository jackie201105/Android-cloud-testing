/**
* File name: ResponseDialog.js
* Author: HongMing
* Component: A response dialog
* Function: Display message using a dialog
*/

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography
} from '@material-ui/core';
import PropTypes from 'prop-types';

const ResponseDialog = ({
  open, handleClose, message, callback
}) => {
  const handleConfirm = () => {
    // close the response dialog and notify its parent screen
    handleClose();
    callback();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title" disableTypography>
        <Typography variant="h3">
          Information
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <DialogContentText id="alert-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="primary" autoFocus variant="outlined">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ResponseDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
  callback: PropTypes.func.isRequired
};

export default ResponseDialog;
