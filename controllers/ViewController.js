
class ViewController {
  home(req, res) {
    if (req.session.userId) {
      return res.redirect('/dashboard');
    }
    res.render('login');
  }

  login(req, res) {
    if (req.session.userId) {
      return res.redirect('/dashboard');
    }
    res.render('login');
  }

  dashboard(req, res) {
    if (!req.session.userId) {
      return res.redirect('/login');
    }
    res.render('dashboard');
  }
}

module.exports = ViewController;
