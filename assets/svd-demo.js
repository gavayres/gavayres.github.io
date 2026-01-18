// SVD Demo Component
const { useState, useEffect, useRef } = React;

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

  const normalize = (v) => {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    return [v[0] / len, v[1] / len];
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

  return React.createElement('div', { style: { maxWidth: '900px', margin: '0 auto', padding: '20px' } },
    React.createElement('div', { style: { borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' } },
      React.createElement('div', { style: { borderBottom: '1px solid', borderColor: 'inherit', padding: '20px' } },
        React.createElement('h2', { style: { fontSize: '24px', fontWeight: '600', margin: 0 } }, 'Linear Transformation: Sphere on Unit Cube')
      ),
      React.createElement('div', { style: { padding: '20px' } },
        React.createElement('canvas', {
          ref: canvasRef,
          width: 600,
          height: 500,
          style: { border: '1px solid #ddd', borderRadius: '4px', width: '100%', marginBottom: '20px' }
        }),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' } },
          React.createElement('div', null,
            React.createElement('h3', { style: { fontSize: '14px', fontWeight: '600', marginBottom: '10px' } }, 'Transformation Matrix'),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' } },
              React.createElement('input', {
                type: 'number',
                value: matrix[0][0],
                onChange: (e) => setMatrix([[+e.target.value, matrix[0][1]], matrix[1]]),
                step: 0.1,
                style: { padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }
              }),
              React.createElement('input', {
                type: 'number',
                value: matrix[0][1],
                onChange: (e) => setMatrix([[matrix[0][0], +e.target.value], matrix[1]]),
                step: 0.1,
                style: { padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }
              }),
              React.createElement('input', {
                type: 'number',
                value: matrix[1][0],
                onChange: (e) => setMatrix([matrix[0], [+e.target.value, matrix[1][1]]]),
                step: 0.1,
                style: { padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }
              }),
              React.createElement('input', {
                type: 'number',
                value: matrix[1][1],
                onChange: (e) => setMatrix([matrix[0], [matrix[1][0], +e.target.value]]),
                step: 0.1,
                style: { padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }
              })
            )
          ),
          React.createElement('div', null,
            React.createElement('h3', { style: { fontSize: '14px', fontWeight: '600', marginBottom: '10px' } }, 'Display Options'),
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
              React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' } },
                React.createElement('input', { type: 'checkbox', checked: showOriginal, onChange: (e) => setShowOriginal(e.target.checked) }),
                'Original (blue)'
              ),
              React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' } },
                React.createElement('input', { type: 'checkbox', checked: showTransformed, onChange: (e) => setShowTransformed(e.target.checked) }),
                'Transformed (red)'
              ),
              React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' } },
                React.createElement('input', { type: 'checkbox', checked: showEigenvectors, onChange: (e) => setShowEigenvectors(e.target.checked) }),
                'Eigenvectors (green/purple)'
              ),
              React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' } },
                React.createElement('input', { type: 'checkbox', checked: showSingularVectors, onChange: (e) => setShowSingularVectors(e.target.checked) }),
                'Singular vectors (orange/pink)'
              )
            )
          )
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', padding: '20px 0', borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'inherit', marginBottom: '20px' } },
          React.createElement('div', null,
            React.createElement('h3', { style: { fontSize: '12px', fontWeight: '600', marginBottom: '8px', opacity: 0.7 } }, 'Determinant'),
            React.createElement('div', { style: { fontSize: '24px', fontFamily: 'monospace' } }, detM.toFixed(3)),
            React.createElement('div', { style: { fontSize: '11px', opacity: 0.6, marginTop: '4px' } }, 'Area scaling factor')
          ),
          React.createElement('div', null,
            React.createElement('h3', { style: { fontSize: '12px', fontWeight: '600', marginBottom: '8px', opacity: 0.7 } }, 'Eigenvalues'),
            evals ? React.createElement('div', null,
              React.createElement('div', { style: { fontSize: '14px', fontFamily: 'monospace' } }, 'λ₁ = ' + evals[0].toFixed(3)),
              React.createElement('div', { style: { fontSize: '14px', fontFamily: 'monospace' } }, 'λ₂ = ' + evals[1].toFixed(3)),
              React.createElement('div', { style: { fontSize: '11px', opacity: 0.6 } }, 'Stretch along eigenvectors')
            ) : React.createElement('div', { style: { fontSize: '14px', opacity: 0.6 } }, 'Complex values')
          ),
          React.createElement('div', null,
            React.createElement('h3', { style: { fontSize: '12px', fontWeight: '600', marginBottom: '8px', opacity: 0.7 } }, 'Singular Values'),
            svdResult ? React.createElement('div', null,
              React.createElement('div', { style: { fontSize: '14px', fontFamily: 'monospace' } }, 'σ₁ = ' + svdResult.s1.toFixed(3)),
              React.createElement('div', { style: { fontSize: '14px', fontFamily: 'monospace' } }, 'σ₂ = ' + svdResult.s2.toFixed(3)),
              React.createElement('div', { style: { fontSize: '11px', opacity: 0.6 } }, 'Principal stretches')
            ) : React.createElement('div', { style: { fontSize: '14px', opacity: 0.6 } }, 'N/A')
          )
        ),
        React.createElement('div', { style: { fontSize: '14px', lineHeight: '1.6' } },
          React.createElement('p', null, React.createElement('strong', null, 'Key insights:')),
          React.createElement('ul', { style: { marginLeft: '20px', marginTop: '12px' } },
            React.createElement('li', { style: { marginBottom: '8px' } },
              React.createElement('strong', null, 'Determinant:'),
              ' The circle\'s area changes by factor |det(A)|. The square\'s area also scales by this factor.',
              Math.abs(detM) < 0.001 && React.createElement('strong', { style: { color: '#dc2626' } }, ' Zero determinant → collapsed to a line (zero area)!')
            ),
            React.createElement('li', { style: { marginBottom: '8px' } },
              React.createElement('strong', null, 'Eigenvalues:'),
              ' Show how much the transformation stretches along its eigenvector directions. The product equals the determinant.'
            ),
            React.createElement('li', { style: { marginBottom: '8px' } },
              React.createElement('strong', null, 'Singular values:'),
              ' Show the principal stretches of the transformation (semi-axes of the resulting ellipse). They always exist and are non-negative.',
              svdResult && Math.min(svdResult.s1, svdResult.s2) < 0.001 && React.createElement('strong', { style: { color: '#dc2626' } }, ' One singular value ≈ 0 means dimension collapse!')
            )
          ),
          React.createElement('p', { style: { marginTop: '16px' } }, React.createElement('strong', null, 'Try these examples:')),
          React.createElement('ul', { style: { marginLeft: '20px', fontSize: '12px', marginTop: '8px' } },
            React.createElement('li', null, 'Singular matrix: [[2, 1], [4, 2]] - det=0, collapses to a line'),
            React.createElement('li', null, 'Rotation: [[0, -1], [1, 0]] - det=1, preserves area, complex eigenvalues'),
            React.createElement('li', null, 'Reflection: [[-1, 0], [0, 1]] - det=-1, flips orientation')
          )
        )
      )
    )
  );
};

// Render the component
ReactDOM.render(React.createElement(SVDDemo), document.getElementById('svd-demo'));