const { Client } = require('@googlemaps/google-maps-services-js');
const { getPlacesCount } = require('../googlePlacesService');

jest.mock('@googlemaps/google-maps-services-js');

describe('googlePlacesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getPlacesCount', () => {
    it('should return the correct number of places', async () => {
      const mockResponse = {
        data: {
          results: [
            { name: 'Business 1' },
            { name: 'Business 2' },
            { name: 'Business 3' },
          ],
        },
      };

      Client.prototype.textSearch = jest.fn().mockResolvedValue(mockResponse);

      const result = await getPlacesCount('restaurant', '12345');

      expect(result).toBe(3);
      expect(Client.prototype.textSearch).toHaveBeenCalledWith({
        params: {
          query: 'restaurant in 12345',
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      });
    });

    it('should return 0 when no places are found', async () => {
      const mockResponse = {
        data: {
          results: [],
        },
      };

      Client.prototype.textSearch = jest.fn().mockResolvedValue(mockResponse);

      const result = await getPlacesCount('nonexistent', '00000');

      expect(result).toBe(0);
    });

    it('should retry on failure and succeed', async () => {
      const mockError = new Error('API Error');
      const mockResponse = {
        data: {
          results: [{ name: 'Business 1' }],
        },
      };

      Client.prototype.textSearch = jest.fn()
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockResponse);

      const result = await getPlacesCount('restaurant', '12345');

      expect(result).toBe(1);
      expect(Client.prototype.textSearch).toHaveBeenCalledTimes(3);
    });

    it('should throw an error after max retries', async () => {
      const mockError = new Error('API Error');

      Client.prototype.textSearch = jest.fn().mockRejectedValue(mockError);

      await expect(getPlacesCount('restaurant', '12345')).rejects.toThrow('API Error');
      expect(Client.prototype.textSearch).toHaveBeenCalledTimes(4); // Initial attempt + 3 retries
    });
  });
});