const userService = require('../services/userService');



exports.getUsersCount = async (req, res) => {
    try {
        const counts = await userService.getUsersCount();
      
        res.json(counts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
 
exports.getUsers = async (req, res) => {
    try {
        const { page = 1, pageSize = 10, name, whatsapp, plan } = req.query;

        // Call the service with pagination and filters
        const users = await userService.getAllUsers({
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            filters: { name, whatsapp, plan }
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addUser = async (req, res) => {
    try {
        const newUser = await userService.addUser(req.body);
        res.json(newUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.updateNotificationsSetting = async (req, res) => {
    try {
        await userService.updateNotificationsSetting(req.params.preferredPlan, req.body);
        res.json({ message: 'User settings updated successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getNotificationsSetting = async (req, res) => {
    try {
        const setting = await userService.getNotificationsSetting(req.params.preferredPlan);
        res.json(setting);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



exports.updateUser = async (req, res) => {
    try {
        const updatedUser = await userService.updateUser(req.params.userId, req.body);
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await userService.deleteUser(req.params.userId);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}; 