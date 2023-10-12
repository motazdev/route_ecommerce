// export const asyncHandler = (controller) => {
//     return (req, res, next) => {
//         controller(req, res, next).catch((err) => {
//             // console.log("err from asyncHandler: ", err);
//             return next(new Error(err));
//         });
//     };
// };
export const asyncHandler = (controller) => {
    return (req, res, next) => {
      controller(req, res, next).catch((error) => next(error));
    };
  };
  

// export const asyncHandler = (controller) => {
//     return async (req, res, next) => {
//         try {
//             await controller(req, res, next);
//         } catch (err) {
//             if (!res.headersSent) {

//                 next(err);
//             }
//         }
//     };
// };