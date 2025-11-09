
export const getHome = (req,res) => {
  res.render('pages/home', { title: 'Home' });
};
export const getAbout = (req,res) => res.render('pages/about', { title: 'About' });
export const getContact = (req,res) => res.render('pages/contact', { title: 'Contact' });
export const postContact = (req,res) => {
  req.flash('success', 'Message sent successfully!');
  res.redirect('/contact');
};
