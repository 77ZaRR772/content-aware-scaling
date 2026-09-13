self.onmessage = function(e) {
	const { imageData, width, height, mode } = e.data;
	const data = imageData.data;
	
	// Energy map calculation
	const energyMap = new Float32Array(width * height);
	
	if (mode === 'sobel') {
		calculateSobelEnergy(data, width, height, energyMap);
	} else {
		calculateSimpleEnergy(data, width, height, energyMap);
	}
	
	// Find the lowest energy seam using Dynamic Programming
	const seam = findLowestSeam(energyMap, width, height);
	
	// Remove the seam
	const newData = new Uint8ClampedArray(data.length);
	removeSeam(data, width, height, seam, newData);
	
	self.postMessage({
		imageData: new ImageData(newData, width - 1, height),
		seam: seam
	}, [newData.buffer]);
};

function calculateSimpleEnergy(data, width, height, energyMap) {
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			let energy = 0;
			if (x > 0 && x < width - 1) {
				energy = pixelDiff(data, width, x - 1, y, x + 1, y);
			} else if (x === 0) {
				energy = pixelDiff(data, width, x, y, x + 1, y);
			} else {
				energy = pixelDiff(data, width, x - 1, y, x, y);
			}
			energyMap[y * width + x] = energy;
		}
	}
}

function calculateSobelEnergy(data, width, height, energyMap) {
	const gx = new Float32Array(width * height);
	const gy = new Float32Array(width * height);
	
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			let sumX = 0;
			let sumY = 0;
			
			for (let dy = -1; dy <= 1; dy++) {
				for (let dx = -1; dx <= 1; dx++) {
					const nx = Math.min(Math.max(x + dx, 0), width - 1);
					const ny = Math.min(Math.max(y + dy, 0), height - 1);
					const offset = (ny * width + nx) * 4;
					
					// Luminance
					const lum = 0.299 * data[offset] + 0.587 * data[offset + 1] + 0.114 * data[offset + 2];
					
					const weightX = (dx === 0) ? 0 : (dx === -1 ? -1 : 1) * (dy === 0 ? 2 : 1);
					const weightY = (dy === 0) ? 0 : (dy === -1 ? -1 : 1) * (dx === 0 ? 2 : 1);
					
					sumX += lum * weightX;
					sumY += lum * weightY;
				}
			}
			gx[y * width + x] = sumX;
			gy[y * width + x] = sumY;
		}
	}
	
	for (let i = 0; i < energyMap.length; i++) {
		energyMap[i] = Math.sqrt(gx[i] * gx[i] + gy[i] * gy[i]);
	}
}

function pixelDiff(data, width, x0, y0, x1, y1) {
	const offset0 = (y0 * width + x0) * 4;
	const offset1 = (y1 * width + x1) * 4;
	return Math.sqrt(
		Math.pow(data[offset0] - data[offset1], 2) +
		Math.pow(data[offset0 + 1] - data[offset1 + 1], 2) +
		Math.pow(data[offset0 + 2] - data[offset1 + 2], 2)
	);
}

function findLowestSeam(energyMap, width, height) {
	const dist = new Float32Array(width * height);
	const edgeTo = new Int32Array(width * height);
	
	// Initialize first row
	for (let x = 0; x < width; x++) {
		dist[x] = energyMap[x];
	}
	
	for (let y = 1; y < height; y++) {
		for (let x = 0; x < width; x++) {
			let minPrevDist = dist[(y - 1) * width + x];
			let prevX = x;
			
			if (x > 0 && dist[(y - 1) * width + x - 1] < minPrevDist) {
				minPrevDist = dist[(y - 1) * width + x - 1];
				prevX = x - 1;
			}
			if (x < width - 1 && dist[(y - 1) * width + x + 1] < minPrevDist) {
				minPrevDist = dist[(y - 1) * width + x + 1];
				prevX = x + 1;
			}
			
			dist[y * width + x] = energyMap[y * width + x] + minPrevDist;
			edgeTo[y * width + x] = prevX;
		}
	}
	
	// Find min in last row
	let minX = 0;
	let minDist = dist[(height - 1) * width];
	for (let x = 1; x < width; x++) {
		if (dist[(height - 1) * width + x] < minDist) {
			minDist = dist[(height - 1) * width + x];
			minX = x;
		}
	}
	
	// Backtrack
	const seam = new Int32Array(height);
	seam[height - 1] = minX;
	for (let y = height - 2; y >= 0; y--) {
		seam[y] = edgeTo[y * width + seam[y + 1]];
	}
	
	return seam;
}

function removeSeam(data, width, height, seam, newData) {
	for (let y = 0; y < height; y++) {
		const seamX = seam[y];
		let col = 0;
		for (let x = 0; x < width; x++) {
			if (x === seamX) continue;
			const offset = (y * width + x) * 4;
			const newOffset = (y * (width - 1) + col) * 4;
			newData[newOffset] = data[offset];
			newData[newOffset + 1] = data[offset + 1];
			newData[newOffset + 2] = data[offset + 2];
			newData[newOffset + 3] = data[offset + 3];
			col++;
		}
	}
}
