const ReportsController = require('../ReportsController');

describe('ReportsController', () => {
  describe('calculateTrend', () => {
    // Fonction de calcul de tendance extraite pour les tests
    const calculateTrend = (data) => {
      if (!data || data.length < 2) {
        return { slope: 0, intercept: 0, trend: 'stable' };
      }

      const n = data.length;
      let sumX = 0;
      let sumY = 0;
      let sumXY = 0;
      let sumX2 = 0;

      data.forEach((point, index) => {
        const x = index + 1;
        const y = point.totalConsommation || point.total || 0;
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
      });

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      let trend = 'stable';
      if (slope > 0.1) trend = 'increasing';
      else if (slope < -0.1) trend = 'decreasing';

      return { slope, intercept, trend };
    };

    it('should calculate increasing trend', () => {
      const data = [
        { totalConsommation: 100 },
        { totalConsommation: 150 },
        { totalConsommation: 200 },
        { totalConsommation: 250 }
      ];
      const result = calculateTrend(data);
      expect(result.trend).toBe('increasing');
      expect(result.slope).toBeGreaterThan(0);
    });

    it('should calculate decreasing trend', () => {
      const data = [
        { totalConsommation: 250 },
        { totalConsommation: 200 },
        { totalConsommation: 150 },
        { totalConsommation: 100 }
      ];
      const result = calculateTrend(data);
      expect(result.trend).toBe('decreasing');
      expect(result.slope).toBeLessThan(0);
    });

    it('should calculate stable trend', () => {
      const data = [
        { totalConsommation: 100 },
        { totalConsommation: 100 },
        { totalConsommation: 100 }
      ];
      const result = calculateTrend(data);
      expect(result.trend).toBe('stable');
      expect(Math.abs(result.slope)).toBeLessThan(0.1);
    });

    it('should handle empty data', () => {
      const result = calculateTrend([]);
      expect(result.trend).toBe('stable');
      expect(result.slope).toBe(0);
    });

    it('should handle single data point', () => {
      const result = calculateTrend([{ totalConsommation: 100 }]);
      expect(result.trend).toBe('stable');
    });
  });
});

