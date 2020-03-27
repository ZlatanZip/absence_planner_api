var router = require('express').Router();
var controller = require('./absenceController');
var auth = require('../../auth/auth');


router.route('/')
    .all(auth.decodeToken())
    .get(auth.authorize('Admin'), controller.get)
    .post(controller.validateAbsenceModel, controller.post)


router.route('/:id')
    .all(auth.decodeToken())
    .put(controller.validatePutAbsenceBody, controller.updateAbsence)
    .delete(controller.removeAbsence)

router.route('/review/:id')
    .all(auth.decodeToken())
    .put(auth.authorize('Admin'), controller.reviewAbsence)


router.route('/invalidate/:id')
    .all(auth.decodeToken())
    .delete(auth.authorize('Admin'), controller.invalidateAbsence)

router.route('/:userId')
    .all(auth.decodeToken())
    .get(controller.getUserAbsences)

router.route('/:userId/:id')
    .all(auth.decodeToken())
    .get(controller.getSingleUserAbsence)

module.exports = router;