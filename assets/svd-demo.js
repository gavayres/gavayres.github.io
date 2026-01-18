import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SVDDemo = () => {
  const canvasRef = useRef(null);
  const [matrix, setMatrix] = useState([[2, 0.5], [0.5, 1]]);
  const [showOriginal, setShowOriginal] = useState(true);
  const [showTransformed, setShowTransformed] = useState(true);
  const [showEigenvectors, setShowEigenvectors] = useState(false);
  const [showSingularVectors, setShowSingularVectors] = useState(false);

  // Matrix math helpers
  const det = (m) => m[0][0] * m[1][1] - m[0][1] * m[1][0];

  const eigenvalues = (m) => {
    const a = m[0][0], b = m[0][1], c = m[1][0], d = m[1][1];
    const trace = a + d;
    const detM = det(m);
    const discriminant = trace * trace - 4 * detM;
    if (discriminant < 0) return null;
    const sqrtDisc = Math.sqrt(discriminant);
    return [(trace + sqrtDisc) / 2, (trace - sqrtDisc) / 2];
  };

  const eigenvector = (m, lambda) => {
    const a = m[0][0] - lambda, b = m[0][1];
    const c = m[1][0], d = m[1][1] - lambda;
    if (Math.abs(b) > 1e-10) return [b, -a];
    if (Math.abs(c) > 1e-10) return [-d, c];
    return [1, 0];
  };

  const getOrthogonalEigenvectors = (m) => {
    const evals = eigenvalues(m);
    if (!evals) return null;

    // For repeated eigenvalues (like identity), any orthogonal pair works
    if (Math.abs(evals[0] - evals[1]) < 1e-6) {
      return { ev1: [1, 0], ev2: [0, 1], evals };
    }

    const ev1 = normalize(eigenvector(m, evals[0]));
    const ev2 = normalize(eigenvector(m, evals[1]));

    return { ev1, ev2, evals };
  };

  const normalize = (v) => {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    return [v[0] / len, v[1] / len];
  };

  const svd2x2 = (m) => {
    const mt = [[m[0][0], m[1][0]], [m[0][1], m[1][1]]];
    const mtm = [
      [mt[0][0] * m[0][0] + mt[0][1] * m[1][0], mt[0][0] * m[0][1] + mt[0][1] * m[1][1]],
      [mt[1][0] * m[0][0] + mt[1][1] * m[1][0], mt[1][0] * m[0][1] + mt[1][1] * m[1][1]]
    ];

    const evals = eigenvalues(mtm);
    if (!evals) return null;

    const s1 = Math.sqrt(Math.max(0, evals[0]));
    const s2 = Math.sqrt(Math.max(0, evals[1]));

    const v1 = normalize(eigenvector(mtm, evals[0]));
    const v2 = normalize(eigenvector(mtm, evals[1]));

    const u1 = normalize([m[0][0] * v1[0] + m[0][1] * v1[1], m[1][0] * v1[0] + m[1][1] * v1[1]]);
    const u2 = normalize([m[0][0] * v2[0] + m[0][1] * v2[1], m[1][0] * v2[0] + m[1][1] * v2[1]]);

    return { u1, u2, v1, v2, s1, s2 };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const scale = 60;

    ctx.clearRect(0, 0, w, h);

    // Draw axes
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(w, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, h);
    ctx.stroke();

    // Transform point
    const transform = (x, y) => [
      matrix[0][0] * x + matrix[0][1] * y,
      matrix[1][0] * x + matrix[1][1] * y
    ];

    // Draw circle/ellipse
    const drawShape = (original) => {
      ctx.beginPath();
      for (let i = 0; i <= 100; i++) {
        const angle = (i / 100) * 2 * Math.PI;
        let x = Math.cos(angle);
        let y = Math.sin(angle);

        if (!original) {
          [x, y] = transform(x, y);
        }

        const px = cx + x * scale;
        const py = cy - y * scale;

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      if (original) {
        ctx.strokeStyle = '#3b82f6';
        ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = '#ef4444';
        ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
        ctx.lineWidth = 2;
      }
      ctx.fill();
      ctx.stroke();
    };

    // Draw square/parallelogram
    const drawBox = (original) => {
      const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
      ctx.beginPath();
      corners.forEach((corner, i) => {
        let [x, y] = corner;
        if (!original) {
          [x, y] = transform(x, y);
        }
        const px = cx + x * scale;
        const py = cy - y * scale;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();

      if (original) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
      } else {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    };

    if (showOriginal) {
      drawBox(true);
      drawShape(true);
    }

    if (showTransformed) {
      drawBox(false);
      drawShape(false);
    }

    // Draw eigenvectors
    const eigData = getOrthogonalEigenvectors(matrix);
    if (showEigenvectors && eigData) {
      const { ev1, ev2, evals } = eigData;

      [[ev1, evals[0], '#10b981'], [ev2, evals[1], '#8b5cf6']].forEach(([vec, val, color]) => {
        const [tx, ty] = transform(vec[0], vec[1]);
        const endX = cx + tx * scale * 1.5;
        const endY = cy - ty * scale * 1.5;

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Arrow head
        const angle = Math.atan2(endY - cy, endX - cx);
        const headLen = 10;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - headLen * Math.cos(angle - Math.PI / 6),
          endY - headLen * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - headLen * Math.cos(angle + Math.PI / 6),
          endY - headLen * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      });
    }

    // Draw singular vectors
    if (showSingularVectors) {
      const svdResult = svd2x2(matrix);
      if (svdResult) {
        const { u1, u2, v1, v2, s1, s2 } = svdResult;

        // Right singular vectors (V) - input space
        [[v1, '#f59e0b'], [v2, '#ec4899']].forEach(([vec, color]) => {
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + vec[0] * scale * 1.5, cy - vec[1] * scale * 1.5);
          ctx.stroke();
          ctx.setLineDash([]);
        });

        // Left singular vectors (U) - output space  
        [[u1, s1, '#f59e0b'], [u2, s2, '#ec4899']].forEach(([vec, s, color]) => {
          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + vec[0] * s * scale * 1.5, cy - vec[1] * s * scale * 1.5);
          ctx.stroke();
        });
      }
    }
  }, [matrix, showOriginal, showTransformed, showEigenvectors, showSingularVectors]);

  const detM = det(matrix);
  const evals = eigenvalues(matrix);
  const svdResult = svd2x2(matrix);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Linear Transformation: Sphere on Unit Cube</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <canvas
            ref={canvasRef}
            width={600}
            height={500}
            className="border border-gray-200 rounded w-full"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Transformation Matrix</h3>
              <div className="space-y-2">
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={matrix[0][0]}
                    onChange={(e) => setMatrix([[+e.target.value, matrix[0][1]], matrix[1]])}
                    step="0.1"
                    className="w-20 px-2 py-1 border rounded"
                  />
                  <input
                    type="number"
                    value={matrix[0][1]}
                    onChange={(e) => setMatrix([[matrix[0][0], +e.target.value], matrix[1]])}
                    step="0.1"
                    className="w-20 px-2 py-1 border rounded"
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={matrix[1][0]}
                    onChange={(e) => setMatrix([matrix[0], [+e.target.value, matrix[1][1]]])}
                    step="0.1"
                    className="w-20 px-2 py-1 border rounded"
                  />
                  <input
                    type="number"
                    value={matrix[1][1]}
                    onChange={(e) => setMatrix([matrix[0], [matrix[1][0], +e.target.value]])}
                    step="0.1"
                    className="w-20 px-2 py-1 border rounded"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Display Options</h3>
              <div className="space-y-1">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showOriginal}
                    onChange={(e) => setShowOriginal(e.target.checked)}
                  />
                  <span className="text-sm">Original (blue)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showTransformed}
                    onChange={(e) => setShowTransformed(e.target.checked)}
                  />
                  <span className="text-sm">Transformed (red)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showEigenvectors}
                    onChange={(e) => setShowEigenvectors(e.target.checked)}
                  />
                  <span className="text-sm">Eigenvectors (green/purple)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showSingularVectors}
                    onChange={(e) => setShowSingularVectors(e.target.checked)}
                  />
                  <span className="text-sm">Singular vectors (orange/pink)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <h3 className="font-semibold text-sm mb-1">Determinant</h3>
              <p className="text-2xl font-mono">{detM.toFixed(3)}</p>
              <p className="text-xs text-gray-600 mt-1">
                Area scaling factor
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-1">Eigenvalues</h3>
              {evals ? (
                <div className="space-y-1">
                  <p className="font-mono text-sm">λ₁ = {evals[0].toFixed(3)}</p>
                  <p className="font-mono text-sm">λ₂ = {evals[1].toFixed(3)}</p>
                  <p className="text-xs text-gray-600">Stretch along eigenvectors</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Complex values</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-1">Singular Values</h3>
              {svdResult ? (
                <div className="space-y-1">
                  <p className="font-mono text-sm">σ₁ = {svdResult.s1.toFixed(3)}</p>
                  <p className="font-mono text-sm">σ₂ = {svdResult.s2.toFixed(3)}</p>
                  <p className="text-xs text-gray-600">Principal stretches</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">N/A</p>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-700 space-y-2 pt-4 border-t">
            <p><strong>Key insights:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Determinant:</strong> The circle's area changes by factor |det(A)|. The square's area also scales by this factor. {Math.abs(detM) < 0.001 && <strong className="text-red-600">Zero determinant → collapsed to a line (zero area)!</strong>}</li>
              <li><strong>Eigenvalues:</strong> Show how much the transformation stretches along its eigenvector directions. The product equals the determinant.</li>
              <li><strong>Singular values:</strong> Show the principal stretches of the transformation (semi-axes of the resulting ellipse). They always exist and are non-negative. {svdResult && Math.min(svdResult.s1, svdResult.s2) < 0.001 && <strong className="text-red-600">One singular value ≈ 0 means dimension collapse!</strong>}</li>
            </ul>
            <p className="pt-2"><strong>Try these examples:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Singular matrix: [[2, 1], [4, 2]] - det=0, collapses to a line</li>
              <li>Rotation: [[0, -1], [1, 0]] - det=1, preserves area, complex eigenvalues</li>
              <li>Reflection: [[-1, 0], [0, 1]] - det=-1, flips orientation</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SVDDemo;