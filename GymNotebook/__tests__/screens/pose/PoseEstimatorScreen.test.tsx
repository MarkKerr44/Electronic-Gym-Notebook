import {
    invertY,
    calculateAngle,
    isPoseValid,
    calcFlareAngle,
  } from "../../../src/screens/pose/PoseEstimatorScreen";

  describe('invertY', () => {
    test('inverts the Y coordinate correctly', () => {
      const inputPoint = { x: 0.25, y: 0.75, z: 0.0 }
      const result = invertY(inputPoint)
      expect(result.y).toBeCloseTo(0.25) 
      expect(result.x).toBe(0.25)
      expect(result.z).toBe(0.0)
    })
  })

  describe('calculateAngle', () => {
    test('returns 0 if either vector is zero length', () => {
      const a = { x: 0, y: 0 }
      const b = { x: 0, y: 0 }
      const c = { x: 1, y: 1 }
      const angle = calculateAngle(a, b, c)
      expect(angle).toBe(0)
    })
  

    test('calculates known angle correctly', () => {
        const a = { x: 4, y: 0 }
        const b = { x: 0, y: 0 }
        const c = { x: 0, y: 3 }
        const angle = calculateAngle(a, b, c)
        expect(Math.round(angle)).toBe(90)
      })
    })


    describe('isPoseValid', () => {
        test('returns false when a required landmark is undefined', () => {
          const pts = [
            { x: 0, y: 0, z: 0 }, 
            undefined,           
            { x: 0, y: 0, z: 0 }, 
          ]
          const idxs = [0, 1, 2]
          expect(isPoseValid(pts, idxs)).toBe(false)
        })
        })


        describe('calcFlareAngle', () => {
            test('returns 0 if shoulder and elbow points match', () => {
              const shoulder = { x: 0.5, y: 0.5 }
              const elbow = { x: 0.5, y: 0.5 }
              expect(calcFlareAngle(shoulder, elbow)).toBe(0)
            })
          
            test('calculates angle correctly for simple scenario', () => {
              const shoulder = { x: 0, y: 0 }
              const elbow = { x: Math.sqrt(3), y: -1 } 
              const angle = calcFlareAngle(shoulder, elbow)
              expect(Math.round(angle)).toBe(30)
            })
          })
