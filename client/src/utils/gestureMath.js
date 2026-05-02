export const evaluateGestureMatch = (landmarks, targetSign) => {
  let isMatch = false;
  let errorCode = null;

  const thumbTipX = landmarks[4][0];
  const thumbTipY = landmarks[4][1];
  const indexTipY = landmarks[8][1];
  const indexTipX = landmarks[8][0];
  const middleTipY = landmarks[12][1];
  const middleTipX = landmarks[12][0];
  const ringTipY = landmarks[16][1];
  const ringTipX = landmarks[16][0];
  const pinkyTipY = landmarks[20][1];

  const indexBaseY = landmarks[5][1];
  const middleBaseY = landmarks[9][1];
  const ringBaseY = landmarks[13][1];
  const pinkyBaseY = landmarks[17][1];

  const fI_s = indexTipY < indexBaseY - 20;
  const fM_s = middleTipY < middleBaseY - 20;
  const fR_s = ringTipY < ringBaseY - 20;
  const fP_s = pinkyTipY < pinkyBaseY - 20;

  const fI_c = indexTipY > indexBaseY - 10;
  const fM_c = middleTipY > middleBaseY - 10;
  const fR_c = ringTipY > ringBaseY - 10;
  const fP_c = pinkyTipY > pinkyBaseY - 10;
  
  // Scale & Rotation invariant extension check (wrist to tip vs wrist to PIP)
  const d = (i, j) => Math.sqrt(Math.pow(landmarks[i][0] - landmarks[j][0], 2) + Math.pow(landmarks[i][1] - landmarks[j][1], 2));
  const fI_ext = d(0, 8) > d(0, 6);
  const fM_ext = d(0, 12) > d(0, 10);
  const fR_ext = d(0, 16) > d(0, 14);
  const fP_ext = d(0, 20) > d(0, 18);

  const sep_IM = Math.abs(indexTipX - middleTipX) > 20;
  const thumbUp = thumbTipY < indexBaseY - 30;
  const thumbOut = Math.abs(thumbTipX - indexTipX) > 40;
  const thumbTucked = Math.abs(thumbTipX - ringTipX) < 60;

  switch(targetSign) {
    case 'A': 
      isMatch = fI_c && fM_c && fR_c && fP_c && Math.abs(thumbTipX - landmarks[5][0]) < 50;
      if (!isMatch) errorCode = !fI_c ? "ERROR_INDEX_NOT_CURLED" : "ERROR_THUMB_POSITION";
      break;
    case 'B': 
      isMatch = fI_s && fM_s && fR_s && fP_s && thumbTucked; 
      if (!isMatch) errorCode = !fI_s ? "ERROR_INDEX_NOT_STRAIGHT" : (!thumbTucked ? "ERROR_THUMB_NOT_TUCKED" : "ERROR_FINGERS_NOT_STRAIGHT");
      break;
    case 'C': 
      isMatch = !fI_s && !fI_c && !fM_s && !fM_c; 
      if (!isMatch) errorCode = "ERROR_FINGERS_SHOULD_CURVE_LIKE_C";
      break; 
    case 'D': 
      isMatch = fI_s && fM_c && fR_c && fP_c; 
      if (!isMatch) errorCode = !fI_s ? "ERROR_INDEX_NOT_STRAIGHT" : "ERROR_OTHER_FINGERS_NOT_CURLED";
      break;
    case 'E': 
      isMatch = fI_c && fM_c && fR_c && fP_c && Math.abs(thumbTipY - indexTipY) < 30; 
      if (!isMatch) errorCode = "ERROR_FINGERS_NOT_TIGHTLY_CURLED";
      break;
    case 'F': 
      isMatch = fM_s && fR_s && fP_s && Math.abs(indexTipY - thumbTipY) < 30; 
      if (!isMatch) errorCode = !fM_s ? "ERROR_THREE_FINGERS_NOT_STRAIGHT" : "ERROR_INDEX_THUMB_NOT_TOUCHING";
      break;
    case 'G': 
      isMatch = fI_ext && !fM_ext && !fR_ext && !fP_ext && !fI_s; 
      if (!isMatch) errorCode = "ERROR_INDEX_SHOULD_POINT_SIDEWAYS";
      break;
    case 'H': 
      isMatch = fI_ext && fM_ext && !fR_ext && !fP_ext && !sep_IM && !fI_s; 
      if (!isMatch) errorCode = "ERROR_INDEX_MIDDLE_SHOULD_POINT_SIDEWAYS";
      break;
    case 'I': 
      isMatch = fI_c && fM_c && fR_c && fP_s; 
      if (!isMatch) errorCode = !fP_s ? "ERROR_PINKY_NOT_STRAIGHT" : "ERROR_OTHER_FINGERS_NOT_CURLED";
      break;
    case 'J': 
      isMatch = fP_s; 
      if (!isMatch) errorCode = "ERROR_PINKY_NOT_STRAIGHT_SWOOPING";
      break; 
    case 'K': 
      isMatch = fI_s && fM_s && sep_IM && thumbUp; 
      if (!isMatch) errorCode = !thumbUp ? "ERROR_THUMB_NOT_UP" : "ERROR_INDEX_MIDDLE_NOT_SEPARATED";
      break;
    case 'L': 
      isMatch = fI_s && fM_c && fR_c && fP_c && thumbOut; 
      if (!isMatch) errorCode = !thumbOut ? "ERROR_THUMB_NOT_OUT" : "ERROR_INDEX_NOT_STRAIGHT";
      break;
    case 'M': 
      isMatch = fI_c && fM_c && fR_c && fP_c; 
      if (!isMatch) errorCode = "ERROR_THUMB_SHOULD_BE_UNDER_THREE_FINGERS";
      break; 
    case 'N': 
      isMatch = fI_c && fM_c && fR_c && fP_c; 
      if (!isMatch) errorCode = "ERROR_THUMB_SHOULD_BE_UNDER_TWO_FINGERS";
      break; 
    case 'O': 
      isMatch = Math.abs(indexTipY - thumbTipY) < 40 && Math.abs(indexTipX - thumbTipX) < 40; 
      if (!isMatch) errorCode = "ERROR_FINGERS_SHOULD_FORM_O_SHAPE";
      break;
    case 'P': 
      isMatch = fI_ext && fM_ext && !fR_ext && !fP_ext && sep_IM && !fI_s; 
      if (!isMatch) errorCode = "ERROR_WRIST_SHOULD_POINT_DOWN";
      break; 
    case 'Q': 
      isMatch = fI_ext && !fM_ext && !fR_ext && !fP_ext && !fI_s; 
      if (!isMatch) errorCode = "ERROR_INDEX_THUMB_SHOULD_POINT_DOWN";
      break; 
    case 'R': 
      isMatch = fI_s && fM_s && !sep_IM; 
      if (!isMatch) errorCode = "ERROR_INDEX_MIDDLE_SHOULD_CROSS";
      break; 
    case 'S': 
      isMatch = fI_c && fM_c && fR_c && fP_c && thumbTucked; 
      if (!isMatch) errorCode = "ERROR_THUMB_SHOULD_BE_OVER_FINGERS";
      break;
    case 'T': 
      isMatch = fI_c && fM_c && fR_c && fP_c; 
      if (!isMatch) errorCode = "ERROR_THUMB_SHOULD_BE_UNDER_INDEX";
      break;
    case 'U': 
      isMatch = fI_s && fM_s && !sep_IM && fR_c && fP_c; 
      if (!isMatch) errorCode = sep_IM ? "ERROR_INDEX_MIDDLE_SHOULD_TOUCH" : "ERROR_INDEX_MIDDLE_NOT_STRAIGHT";
      break;
    case 'V': 
      isMatch = fI_s && fM_s && sep_IM && fR_c && fP_c; 
      if (!isMatch) errorCode = !sep_IM ? "ERROR_INDEX_MIDDLE_NOT_SEPARATED" : "ERROR_INDEX_MIDDLE_NOT_STRAIGHT";
      break;
    case 'W': 
      isMatch = fI_s && fM_s && fR_s && fP_c; 
      if (!isMatch) errorCode = "ERROR_THREE_FINGERS_NOT_STRAIGHT";
      break;
    case 'X': 
      isMatch = !fI_s && !fI_c && fM_c && fR_c && fP_c; 
      if (!isMatch) errorCode = "ERROR_INDEX_SHOULD_BE_HOOKED";
      break; 
    case 'Y': 
      isMatch = fI_c && fM_c && fR_c && fP_s && thumbOut; 
      if (!isMatch) errorCode = (!thumbOut || !fP_s) ? "ERROR_THUMB_PINKY_NOT_OUT" : "ERROR_MIDDLE_FINGERS_NOT_CURLED";
      break;
    case 'Z': 
      isMatch = fI_s && fM_c && fR_c && fP_c; 
      if (!isMatch) errorCode = "ERROR_INDEX_SHOULD_DRAW_Z";
      break; 
    case 'Thumbs Up Demo': 
      isMatch = thumbUp && fI_c && fM_c && fR_c && fP_c; 
      if (!isMatch) {
         if (!thumbUp) errorCode = "ERROR_THUMB_NOT_UP";
         else errorCode = "ERROR_OTHER_FINGERS_NOT_CURLED";
      }
      break;
    default: 
      isMatch = false;
      errorCode = "ERROR_UNKNOWN_SIGN";
  }

  return { isMatch, errorCode };
};
