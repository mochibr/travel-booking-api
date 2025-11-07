const Country = require('../models/Country');
const State = require('../models/State');
const City = require('../models/City');

class LocationController {
  // Get all countries
  async getCountries(req, res) {
    try {
      const countries = await Country.findAll();
      res.json({
        success: true,
        data: countries,
        message: 'Countries fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching countries:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get country by ID
  async getCountryById(req, res) {
    try {
      const { id } = req.params;
      const country = await Country.findById(id);
      
      if (!country) {
        return res.status(404).json({
          success: false,
          message: 'Country not found'
        });
      }

      res.json({
        success: true,
        data: country,
        message: 'Country fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching country:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get states by country ID
  async getStatesByCountry(req, res) {
    try {
      const { countryId } = req.params;
      const states = await State.findByCountryId(countryId);
      
      res.json({
        success: true,
        data: states,
        message: 'States fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching states:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get state by ID
  async getStateById(req, res) {
    try {
      const { id } = req.params;
      const state = await State.findById(id);
      
      if (!state) {
        return res.status(404).json({
          success: false,
          message: 'State not found'
        });
      }

      res.json({
        success: true,
        data: state,
        message: 'State fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching state:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get cities by state ID
  async getCitiesByState(req, res) {
    try {
      const { stateId } = req.params;
      const cities = await City.findByStateId(stateId);
      
      res.json({
        success: true,
        data: cities,
        message: 'Cities fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching cities:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get city by ID
  async getCityById(req, res) {
    try {
      const { id } = req.params;
      const city = await City.findById(id);
      
      if (!city) {
        return res.status(404).json({
          success: false,
          message: 'City not found'
        });
      }

      res.json({
        success: true,
        data: city,
        message: 'City fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching city:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new LocationController();