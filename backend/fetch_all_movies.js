const axios = require('axios');
const fs = require('fs');
const { parse } = require('csv-parse/sync');

const gids = ['1852959410', '2035338320', '97443646', '1098480737'];
const baseURL = 'https://docs.google.com/spreadsheets/d/1FUTpePzbQvIiV-YGkTpbez03pvQ18ldcxF0FqGwTh5U/export?format=csv&gid=';

async function fetchAll() {
    let allMovies = [];
    let idCounter = 1;

    for (const gid of gids) {
        try {
            console.log(`Fetching tab ${gid}...`);
            const res = await axios.get(baseURL + gid);
            
            // Parse CSV
            const records = parse(res.data, {
                columns: false,
                skip_empty_lines: true
            });
            
            // Start from row 1 to skip headers (if present)
            // But we will just check if row[1] exists and is not empty
            for (let i = 0; i < records.length; i++) {
                const row = records[i];
                if (row.length >= 2) {
                    let title = row[1].trim();
                    if (title && title !== 'Название фильма' && title !== 'Название') {
                        // Word wrap for placeholder
                        let lines = [];
                        let words = title.split(' ');
                        let currentLine = '';
                        for(let w of words) {
                            if ((currentLine + w).length > 15) {
                                if(currentLine) lines.push(currentLine);
                                currentLine = w + ' ';
                            } else {
                                currentLine += w + ' ';
                            }
                        }
                        if(currentLine) lines.push(currentLine);
                        let placeholderText = lines.slice(0, 4).join('\n'); // max 4 lines
                        if (lines.length > 4) placeholderText += '...';
                        
                        const encodedTitle = encodeURIComponent(placeholderText.trim());
                        const colors = ['FF0055', '00CCFF', '00FF66', 'FFFF00', 'FF9900', 'CC00FF', 'FF00CC', '00FFFF', '99FF00', 'FF3300'];
                        const randomColor = colors[Math.floor(Math.random() * colors.length)];
                        
                        allMovies.push({
                            id: `m${idCounter++}`,
                            title: title,
                            posterUrl: `https://placehold.co/400x600/0b0f19/${randomColor}?text=${encodedTitle}`
                        });
                    }
                }
            }
        } catch (e) {
            console.error(`Error on tab ${gid}:`, e.message);
        }
    }
    
    fs.writeFileSync('movies.json', JSON.stringify(allMovies, null, 2));
    console.log(`Successfully saved ${allMovies.length} movies!`);
}

fetchAll();
