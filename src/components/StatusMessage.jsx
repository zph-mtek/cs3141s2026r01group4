import React, { Fragment } from 'react';

const StatusMessageBox = ({ text, messageType }) => {
    let classNameForDiv = 'p-3 rounded-lg text-sm text-center ';
    if (messageType == 'warning') {
        classNameForDiv = classNameForDiv + 'bg-yellow-200 text-yellow-900';
    } else if (messageType == 'success') {
        classNameForDiv = 'bg-green-200 text-green-900';
    } else {
        classNameForDiv = 'bg-red-200 text-red-900';
    }

    return (
        <Fragment>
            <div className={classNameForDiv}>
                {text}
              </div>
        </Fragment>
    )
}

export default StatusMessageBox;