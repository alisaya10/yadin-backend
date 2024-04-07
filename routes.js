let routes = {

  //! employees
  employees: require('./routes/employees'),

  //! users
  users: require('./routes/users'),

  //! blogs
  blogs: require('./routes/blogs'),
  //! userQuiz
  userQuiz: require('./routes/userQuiz'),
  //! userPractice
  userPractice: require('./routes/userPractice'),
  //! notes
  notes: require('./routes/notes'),

  //! courseFiles
  coursefiles: require('./routes/courseFiles'),
  //! vouchers
  vouchers: require('./routes/vouchers'),

  //! quizes
  quizes: require('./routes/quizes'),
  //! question
  question: require('./routes/question'),
  //! wishList
  wishList: require('./routes/wishList'),
  //! ticketing
  ticketing: require('./routes/ticketing'),

  //  //! userLesson
  // userLesson: require('./routes/userLesson'),

  //! userCourse
  userCourse: require('./routes/userCourse'),

  //! reviews
  reviews: require('./routes/reviews'),
  //! finantial
  finantial: require('./routes/finantial'),

  teacherReviews: require('./routes/teacherReviews'),
  //! learningPath
  learningPath: require('./routes/learningPath'),

  //! broadcasts
  broadcasts: require('./routes/broadcasts'),

  //! wishList
  wishList: require('./routes/wishList'),

  //! academy
  academy: require('./routes/academy'),

  //! forums
  forums: require('./routes/forums'),
  //! payments
  payments: require('./routes/payments'),

  //! content
  content: require('./routes/content'),

  //! classroom
  // classrooms: require('./routes/classroom'),

  //! wallpapers
  wallpapers: require('./routes/wallpaper'),

  //! files
  files: require('./routes/files'),
  // //! stream
  stream: require('./routes/stream'),

  //! tests
  // tests: require('./routes/test'),

  //! leitner box
  // leitners: require('./routes/leitnerBox'),

  //! category
  categories: require('./routes/categories'),

  //! cities
  config: require('./routes/cities'),

  //! permission
  permissions: require('./routes/permissions'),

  //! product
  products: require('./routes/products'),

  //!messages
  // messages: require('./routes/messages'),
  
  //!messenger
  messenger: require('./routes/messenger').myApiSwitcher,
  
  //!videos
  videos: require('./routes/videos'),

  //!podcasts
  podcasts: require('./routes/podcasts'),

  //!series
  series: require('./routes/series'),

  episodes: require('./routes/episodes'),


  //!types
  types: require('./routes/types'),

  //!baners
  baners: require('./routes/baners'),
  //!comments
  comments: require('./routes/comments'),

  learningPath: require('./routes/learningPath'),

  userCourse: require('./routes/userCourse'),

  organizationGroup: require('./routes/organizationGroup'),

  organization: require('./routes/organization'),


}

module.exports = routes;