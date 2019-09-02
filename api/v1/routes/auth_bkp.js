import logger from '../../../utils/logger'
import express from 'express'

const isLoggedInPolicie = require('../policies/isLoggedIn.js')
const isUserAuthenticatedPolicy = require('../policies/isUserAuthenticated.js')
const UserController = require('../controllers/userController/user.js')
const BlogController = require('../controllers/userController/blog.js')
const CategoryController = require('../controllers/userController/category.js')
const CommonController = require('../controllers/userController/common.js')
const AddressController = require('../controllers/userController/address.js')
const TestController = require('../controllers/userController/test.js')
const ExerciseController = require('../controllers/userController/exercise.js')
const AppointmentController = require('../controllers/userController/appointment.js')
const TempController = require('../controllers/userController/temp.js')
const router = express.Router()
const decodeReqPolicy = require('../policies/decodeRequest.js')
const encodeResPolicy = require('../policies/encodeResponse.js')
const AESCrypt = rootRequire('utils/aes')
const isAdminAuthenticated = require('../policies/isAdminAuthenticated')
// Import Admin Controller
const AdBlogController = require('../controllers/adminController/adblog.js')
const AdCommonController = require('../controllers/adminController/adcommon.js')
const AdLoginController = require('../controllers/adminController/adlogin.js')
const AdRecipeController = require('../controllers/adminController/adrecipe.js')
const AdSlotController = require('../controllers/adminController/adslots.js')
const AdTestController = require('../controllers/adminController/adtest.js')
const AdUsersController = require('../controllers/adminController/adusers.js')
const AdCategoryController = require('../controllers/adminController/adcategory.js')

router.get('/encode', function (req, res) {
  res.render('encode')
})

router.post('/encode', function (req, res) {
  var body = req.body

  logger.info('ENCODE BREQ BODY :->', body);

  try {
    var json = eval('(' + body.data + ')')
    var enc = AESCrypt.encrypt(JSON.stringify(json))
  } catch (e) {
    var enc = 'Invalid parameters'
  }
  res.send({
    'encoded': enc
  })
})

router.get('/decode', function (req, res) {
  res.render('decode')
})

router.post('/decode', function (req, res) {
  var body = req.body

  logger.info('DECODE REQ BODY :->', body)

  try {
    var dec = AESCrypt.decrypt(JSON.stringify(body.data))
  } catch (e) {
    var dec = 'Invalid parameters'
  }
  res.send(dec)
})

// decode request data
router.all('/*', function (req, res, next) {
  res.sendToEncode = function (data) {
    req.resbody = data
    next()
  }
  next()
}, decodeReqPolicy)

/**
 * Authentication Middleware (BEFORE)
 * Serve all apis before MIDDLE if they serve like /api/*
 */
router.all('/api/*', isUserAuthenticatedPolicy, isLoggedInPolicie)
/**
 * Authentication Middleware (BEFORE) For Admin Panel
 */
router.all('/admin/*', isAdminAuthenticated)

/**
 * Other APIs Routes (MIDDLE)
 */
router.get('/api/test', UserController.test)

/**
 * Users Account & Authentication APIs
 */
// User Controller
router.post('/auth/login', UserController.login)
router.post('/auth/forgotPassword', UserController.forgotPassword)
router.get('/reset/:token', UserController.renderResetHtmlTemplate)
router.post('/reset/:token', UserController.resetPassword)
router.post('/api/getUserProfile', UserController.getUserProfile)
router.post('/auth/signup', UserController.signup)
router.post('/auth/getMetaData', UserController.getMetaData)
router.post('/api/changePassword', UserController.changePassword)
router.post('/api/deactiveAccount', UserController.deactiveAccount)
router.post('/api/changeNotificationStatus', UserController.changeNotificationStatus)
router.post('/api/sendFeedback', UserController.sendFeedback)
router.post('/api/updateBasicDetails', UserController.updateBasicDetails)
router.post('/api/updateGoal', UserController.updateGoal)
router.post('/api/updatePersonalDetails', UserController.updatePersonalDetails)
router.post('/api/addStepsCount', UserController.addStepsCount)
router.post('/api/getStepsCount', UserController.getStepsCount)
router.post('/api/updateTierPlan', UserController.updateTierPlan)
router.post('/api/updateQuestionnaire', UserController.updateQuestionnaire)
router.post('/api/updateProfileImage', UserController.updateProfileImage)
router.post('/api/tierWaitingInOut', UserController.tierWaiting)


// Blog Controller
router.post('/api/getBlog', BlogController.getBlog)
router.post('/api/favouriteUnfavouriteBlog', BlogController.favouriteUnfavouriteBlog)
router.post('/api/createBlogDetails', BlogController.createBlogDetails)
router.post('/api/getUsersFavouriteBlog', BlogController.getUsersFavouriteBlog)

// Category Controller
router.post('/api/getCategory', CategoryController.getCategory)

// Common Controller
router.post('/api/getCookingVideo', CommonController.getCookingVideo)
router.post('/api/getTipsOfDay', CommonController.getTipsOfDay)
router.get('/api/getIngredients', CommonController.getIngredients)
router.post('/auth/searchIngredients', CommonController.searchIngredients)

// Address Controller
router.post('/api/addAddress', AddressController.addAddress)
router.post('/api/getAddress', AddressController.getAddress)
router.post('/api/deleteAddress', AddressController.deleteAddress)
router.post('/api/updateAddress', AddressController.updateAddress)

// Test Controller
router.post('/api/getMyTest', TestController.getMyTest)
router.post('/api/getAllTest', TestController.getAllTest)

// Exercise Controller
router.post('/api/getExercise', ExerciseController.getExercise)
router.get('/api/getExerciseCategory', ExerciseController.getExerciseCategory)

// Appointment Controller
router.post('/api/getAvailableSlots', AppointmentController.getAvailableSlots)
router.post('/api/callSchedule', AppointmentController.callSchedule)
router.post('/api/reScheduledCall', AppointmentController.reScheduledCall)
router.post('/api/getMyAppointment', AppointmentController.getMyAppointment)

// Temp Controller
router.post('/admin/addTempReport', TempController.addTempReportRecord)
router.post('/admin/getTempReport', TempController.getTempReportRecord)
router.post('/admin/deleteTempReport', TempController.deleteTempReportRecord)

/**
 * Admin API's Start Here
 */
// Admin Login API's
router.post('/auth/adminLogin', AdLoginController.adminLogin)
router.post('/admin/changePassword', AdLoginController.changePassword)

// Admin Users API's
router.post('/admin/updateUserPermissions', AdUsersController.updateUserPermissions)
router.post('/admin/getAllUserListing', AdUsersController.getAllUserListing)
router.post('/admin/getUsersDetails', AdUsersController.getUsersDetails)
router.post('/admin/changedUserStatus', AdUsersController.changedUserStatus)
router.post('/admin/getAllDoctorListing', AdUsersController.getAllDoctorListing)
router.post('/admin/changedDoctorstatus', AdUsersController.changedDoctorstatus)
router.post('/admin/getDoctorDetails', AdUsersController.getDoctorDetails)
router.post('/admin/addNewDoctor', AdUsersController.addNewDoctor)
router.post('/auth/setUserPassword', AdUsersController.setUserPassword)
router.post('/admin/getUserProfile', AdUsersController.getUserProfile)
router.post('/admin/updateUserProfile', AdUsersController.updateUserProfile)
router.post('/admin/getAllNutritionListing', AdUsersController.getAllNutritionListing)
router.post('/admin/changedNutritionStatus', AdUsersController.changedNutritionStatus)
router.post('/admin/addNutrition', AdUsersController.addNewNutrition)
router.post('/admin/getNutritionDetails', AdUsersController.getNutritionDetails)
router.post('/admin/addNewChef', AdUsersController.addNewChef)
router.post('/admin/getChefDetails', AdUsersController.getChefDetails)
router.post('/admin/changedChefStatus', AdUsersController.changedChefStatus)
router.post('/admin/getAllChefListing', AdUsersController.getAllChefListing)
router.post('/admin/getAllLabAssistantListing', AdUsersController.getAllLabAssistantListing)
router.post('/admin/changedLabAssistantStatus', AdUsersController.changedLabAssistantStatus)
router.post('/admin/addNewLabAssistant', AdUsersController.addNewLabAssistant)
router.post('/admin/getLabAssistantDetails', AdUsersController.getLabAssistantDetails)

// Admin Common API's
router.get('/admin/getPermissionList', AdCommonController.getPermission)
router.get('/admin/getIngredients', AdCommonController.getIngredients)
router.get('/admin/getFoodCategory', AdCommonController.getFoodCategory)

// Admin Blog API's
router.post('/admin/getAllBlogListing', AdBlogController.getAllBlogListing)
router.post('/admin/changedBlogStatus', AdBlogController.changedBlogStatus)
router.post('/admin/addNewBlog', AdBlogController.addNewBlog)
router.post('/admin/updateBlog', AdBlogController.updateBlog)
router.post('/admin/getBlogDetails', AdBlogController.getBlogDetails)
router.post('/admin/deleteBlog', AdBlogController.deleteBlog)

// Admin Test API's
router.post('/admin/addTestReport', AdTestController.addTestReport)
router.post('/admin/uploadTestReport', AdTestController.uploadTestReport)
router.get('/admin/getMicronutrientsReportCategory', AdTestController.getMicronutrientsReportCategory)
router.get('/admin/getMicronutrientsReportCategoryContent', AdTestController.getMicronutrientsReportCategoryContent)
router.post('/admin/addMicronutrientsTestReport', AdTestController.addMicronutrientsTestReport)

// Admin Slot API's
router.post('/admin/getOldSelectedSlots', AdSlotController.getOldSelectedSlots)
router.post('/admin/changedSlots', AdSlotController.changedSlots)
router.post('/admin/addHolidayDate', AdSlotController.addHolidayDate)
router.post('/admin/getHolidayDate', AdSlotController.getHolidayDate)
router.post('/admin/deleteHolidayDate', AdSlotController.deleteHolidayDate)

// Admin Recipe API's
router.post('/admin/addRecipe', AdRecipeController.addRecipe)
router.post('/admin/getAllRecipeListing', AdRecipeController.getAllRecipeListing)
router.post('/admin/changedRecipeStatus', AdRecipeController.changedRecipeStatus)
router.post('/admin/getRecipeDetails', AdRecipeController.getRecipeDetails)

// Admin Category API's
router.post('/admin/getAllCategoryListing', AdCategoryController.getAllCategoryListing)
router.post('/admin/changedCategoryStatus', AdCategoryController.changedCategoryStatus)
router.post('/admin/addNewCategory', AdCategoryController.addNewCategory)
router.post('/admin/updateCategory', AdCategoryController.updateCategory)
router.post('/admin/getCategoryDetails', AdCategoryController.getCategoryDetails)
router.post('/admin/deleteCategory', AdCategoryController.deleteCategory)

/**
 * Admin API's End Here
 */

/**
 * Responses Middleware (AFTER)
 * Serve all apis after MIDDLE if they serve like /api/*
 */
router.all('/*', encodeResPolicy)

// exports router
module.exports = router
