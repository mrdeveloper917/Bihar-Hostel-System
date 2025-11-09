
export const protectStudent = (req,res,next)=>{
  if (!req.session.user || req.session.user.role !== 'student') return res.redirect('/login');
  next();
};
export const protectAdmin = (req,res,next)=>{
  if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
  next();
};
