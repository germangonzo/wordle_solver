rows = Array.from(document.querySelectorAll('div[role="row"]'))
index = rows.findIndex(r=>r.ariaLabel.match(/current guess/i))
columns = Array.from(rows[index-1].querySelectorAll('.quordle-box'))
columns.map(c=> Array.from(c.classList).includes('bg-box-correct') ? c.querySelector('.quordle-box-content').innerText : '')
columns.map(c=> Array.from(c.classList).includes('bg-box-diff') ? c.querySelector('.quordle-box-content').innerText : '')

//enter a new word
"HELLO".split('').forEach(l => document.dispatchEvent(new KeyboardEvent('keydown',{'key':l})))
document.dispatchEvent(new KeyboardEvent('keydown',{'key':'Enter'}));