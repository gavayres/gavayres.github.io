(function() {
  'use strict';

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

  function initSVDDemo(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let matrix = [[2, 0.5], [0.5, 1]];
    let showOriginal = true;
    let showTransformed = true;
    let showEigenvectors = false;
    let showSingularVectors = false;

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 500;
    canvas.style.border = '1px solid #e5e7eb';
    canvas.style.borderRadius = '4px';
    canvas.style.width = '100%';
    canvas.style.maxWidth = '600px';
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';

    // Create controls
    const controlsDiv = document.createElement('div');
    controlsDiv.style.display = 'grid';
    controlsDiv.style.gridTemplateColumns = '1fr 1fr';
    controlsDiv.style.gap = '1rem';
    controlsDiv.style.marginTop = '1rem';

    // Matrix inputs
    const matrixDiv = document.createElement('div');
    matrixDiv.innerHTML = '<h3 style="font-weight: 600; margin-bottom: 0.5rem;">Transformation Matrix</h3>';
    const matrixInputs = document.createElement('div');
    matrixInputs.style.display = 'flex';
    matrixInputs.style.flexDirection = 'column';
    matrixInputs.style.gap = '0.5rem';

    const createMatrixInput = (row, col, value) => {
      const input = document.createElement('input');
      input.type = 'number';
      input.value = value;
      input.step = '0.1';
      input.style.width = '80px';
      input.style.padding = '0.25rem 0.5rem';
      input.style.border = '1px solid #d1d5db';
      input.style.borderRadius = '4px';
      input.addEventListener('input', (e) => {
        matrix[row][col] = parseFloat(e.target.value) || 0;
        updateDisplay();
      });
      return input;
    };

    const row1 = document.createElement('div');
    row1.style.display = 'flex';
    row1.style.gap = '0.5rem';
    row1.appendChild(createMatrixInput(0, 0, matrix[0][0]));
    row1.appendChild(createMatrixInput(0, 1, matrix[0][1]));
    matrixInputs.appendChild(row1);

    const row2 = document.createElement('div');
    row2.style.display = 'flex';
    row2.style.gap = '0.5rem';
    row2.appendChild(createMatrixInput(1, 0, matrix[1][0]));
    row2.appendChild(createMatrixInput(1, 1, matrix[1][1]));
    matrixInputs.appendChild(row2);

    matrixDiv.appendChild(matrixInputs);

    // Display options
    const optionsDiv = document.createElement('div');
    optionsDiv.innerHTML = '<h3 style="font-weight: 600; margin-bottom: 0.5rem;">Display Options</h3>';
    const optionsList = document.createElement('div');
    optionsList.style.display = 'flex';
    optionsList.style.flexDirection = 'column';
    optionsList.style.gap = '0.25rem';

    const createCheckbox = (label, checked, callback) => {
      const labelEl = document.createElement('label');
      labelEl.style.display = 'flex';
      labelEl.style.alignItems = 'center';
      labelEl.style.gap = '0.5rem';
      labelEl.style.fontSize = '0.875rem';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = checked;
      checkbox.addEventListener('change', callback);
      const span = document.createElement('span');
      span.textContent = label;
      labelEl.appendChild(checkbox);
      labelEl.appendChild(span);
      return labelEl;
    };

    optionsList.appendChild(createCheckbox('Original (blue)', showOriginal, (e) => {
      showOriginal = e.target.checked;
      updateDisplay();
    }));
    optionsList.appendChild(createCheckbox('Transformed (red)', showTransformed, (e) => {
      showTransformed = e.target.checked;
      updateDisplay();
    }));
    optionsList.appendChild(createCheckbox('Eigenvectors (green/purple)', showEigenvectors, (e) => {
      showEigenvectors = e.target.checked;
      updateDisplay();
    }));
    optionsList.appendChild(createCheckbox('Singular vectors (orange/pink)', showSingularVectors, (e) => {
      showSingularVectors = e.target.checked;
      updateDisplay();
    }));

    optionsDiv.appendChild(optionsList);
    controlsDiv.appendChild(matrixDiv);
    controlsDiv.appendChild(optionsDiv);

    // Stats
    const statsDiv = document.createElement('div');
    statsDiv.style.display = 'grid';
    statsDiv.style.gridTemplateColumns = 'repeat(3, 1fr)';
    statsDiv.style.gap = '1rem';
    statsDiv.style.paddingTop = '1rem';
    statsDiv.style.borderTop = '1px solid #e5e7eb';
    statsDiv.style.marginTop = '1rem';

    const detDiv = document.createElement('div');
    const evalsDiv = document.createElement('div');
    const svalsDiv = document.createElement('div');

    statsDiv.appendChild(detDiv);
    statsDiv.appendChild(evalsDiv);
    statsDiv.appendChild(svalsDiv);

    const updateStats = () => {
      const detM = det(matrix);
      const evals = eigenvalues(matrix);
      const svdResult = svd2x2(matrix);

      detDiv.innerHTML = `
        <h3 style="font-weight: 600; font-size: 0.875rem; margin-bottom: 0.25rem;">Determinant</h3>
        <p style="font-size: 1.5rem; font-family: monospace;">${detM.toFixed(3)}</p>
        <p style="font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem;">Area scaling factor</p>
      `;

      if (evals) {
        evalsDiv.innerHTML = `
          <h3 style="font-weight: 600; font-size: 0.875rem; margin-bottom: 0.25rem;">Eigenvalues</h3>
          <p style="font-family: monospace; font-size: 0.875rem;">λ₁ = ${evals[0].toFixed(3)}</p>
          <p style="font-family: monospace; font-size: 0.875rem;">λ₂ = ${evals[1].toFixed(3)}</p>
          <p style="font-size: 0.75rem; color: #6b7280;">Stretch along eigenvectors</p>
        `;
      } else {
        evalsDiv.innerHTML = `
          <h3 style="font-weight: 600; font-size: 0.875rem; margin-bottom: 0.25rem;">Eigenvalues</h3>
          <p style="font-size: 0.875rem; color: #6b7280;">Complex values</p>
        `;
      }

      if (svdResult) {
        svalsDiv.innerHTML = `
          <h3 style="font-weight: 600; font-size: 0.875rem; margin-bottom: 0.25rem;">Singular Values</h3>
          <p style="font-family: monospace; font-size: 0.875rem;">σ₁ = ${svdResult.s1.toFixed(3)}</p>
          <p style="font-family: monospace; font-size: 0.875rem;">σ₂ = ${svdResult.s2.toFixed(3)}</p>
          <p style="font-size: 0.75rem; color: #6b7280;">Principal stretches</p>
        `;
      } else {
        svalsDiv.innerHTML = `
          <h3 style="font-weight: 600; font-size: 0.875rem; margin-bottom: 0.25rem;">Singular Values</h3>
          <p style="font-size: 0.875rem; color: #6b7280;">N/A</p>
        `;
      }
    };

    const updateDisplay = () => {
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

      const transform = (x, y) => [
        matrix[0][0] * x + matrix[0][1] * y,
        matrix[1][0] * x + matrix[1][1] * y
      ];

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

      const evals = eigenvalues(matrix);
      if (showEigenvectors && evals && evals[0] !== null) {
        const ev1 = normalize(eigenvector(matrix, evals[0]));
        const ev2 = normalize(eigenvector(matrix, evals[1]));
        
        [[ev1, evals[0], '#10b981'], [ev2, evals[1], '#8b5cf6']].forEach(([vec, val, color]) => {
          const [tx, ty] = transform(vec[0], vec[1]);
          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + tx * scale * 1.5, cy - ty * scale * 1.5);
          ctx.stroke();
          
          const angle = Math.atan2(-ty, tx);
          ctx.beginPath();
          ctx.moveTo(cx + tx * scale * 1.5, cy - ty * scale * 1.5);
          ctx.lineTo(
            cx + tx * scale * 1.5 - 10 * Math.cos(angle - 0.3),
            cy - ty * scale * 1.5 + 10 * Math.sin(angle - 0.3)
          );
          ctx.moveTo(cx + tx * scale * 1.5, cy - ty * scale * 1.5);
          ctx.lineTo(
            cx + tx * scale * 1.5 - 10 * Math.cos(angle + 0.3),
            cy - ty * scale * 1.5 + 10 * Math.sin(angle + 0.3)
          );
          ctx.stroke();
        });
      }

      if (showSingularVectors) {
        const svdResult = svd2x2(matrix);
        if (svdResult) {
          const { u1, u2, v1, v2, s1, s2 } = svdResult;
          
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

      updateStats();
    };

    // Assemble container
    const wrapper = document.createElement('div');
    wrapper.style.maxWidth = '800px';
    wrapper.style.margin = '0 auto';
    wrapper.style.padding = '1rem';

    const title = document.createElement('h2');
    title.textContent = 'Linear Transformation: Sphere on Unit Cube';
    title.style.fontSize = '1.5rem';
    title.style.fontWeight = '600';
    title.style.marginBottom = '1rem';

    wrapper.appendChild(title);
    wrapper.appendChild(canvas);
    wrapper.appendChild(controlsDiv);
    wrapper.appendChild(statsDiv);

    const insights = document.createElement('div');
    insights.style.fontSize = '0.875rem';
    insights.style.color = '#374151';
    insights.style.marginTop = '1rem';
    insights.style.paddingTop = '1rem';
    insights.style.borderTop = '1px solid #e5e7eb';
    insights.innerHTML = `
      <p style="font-weight: 600; margin-bottom: 0.5rem;"><strong>Key insights:</strong></p>
      <ul style="list-style: disc; list-style-position: inside; margin: 0; padding: 0;">
        <li style="margin-bottom: 0.25rem;"><strong>Determinant:</strong> The circle's area changes by factor |det(A)|. The square's area also scales by this factor.</li>
        <li style="margin-bottom: 0.25rem;"><strong>Eigenvalues:</strong> Show how much the transformation stretches along its eigenvector directions. The product equals the determinant.</li>
        <li style="margin-bottom: 0.25rem;"><strong>Singular values:</strong> Show the principal stretches of the transformation (semi-axes of the resulting ellipse). They always exist and are non-negative.</li>
      </ul>
    `;
    wrapper.appendChild(insights);

    container.appendChild(wrapper);

    // Initial render
    updateDisplay();
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      if (document.getElementById('svd-demo')) {
        initSVDDemo('svd-demo');
      }
    });
  } else {
    if (document.getElementById('svd-demo')) {
      initSVDDemo('svd-demo');
    }
  }

  // Export for manual initialization
  window.initSVDDemo = initSVDDemo;
})();

