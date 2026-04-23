class TimeTracking{
	constructor({currentEl, previousEl}) {
		this.data = null;
		this.timeCurrentEl = currentEl;
		this.timePreviousEl = previousEl;
	}

	#updateTime(data, index, keyItem, lastDate){
		const currentTimeEl = this.timeCurrentEl[index];
		const previousTimeEl = this.timePreviousEl[index];
		const timeframe = data[index]["timeframes"][keyItem];

		if(timeframe && currentTimeEl){
			currentTimeEl.textContent = `${timeframe["current"]}hrs`
		}

		if(timeframe && previousTimeEl){
			previousTimeEl.textContent = `${lastDate} - ${timeframe["previous"]}hrs`
		}
	}

	select(keyItem){
		if(Array.isArray(this.data) && this.data.length > 0){
			for(let i = 0; i < this.data.length; i++){
				if(keyItem === "daily") this.#updateTime(this.data, i, keyItem, "Last Day");
				if(keyItem === "weekly") this.#updateTime(this.data, i, keyItem, "Last Week");
				if(keyItem === "monthly") this.#updateTime(this.data, i, keyItem, "Last Month");
			}
		}
	}
}

async function fetchData(url){
	try {
		const response = await fetch(url);
		if(response.ok){
			const data = await response.json();
			return Array.isArray(data) ? [...data] : [];
		}

		console.warn(`fetch failed: ${response.status} ${response.statusText}`);
		return [];
	}catch(error) {
		console.error(error);
		return [];
	}
}

function getSelectorAll(selector){
	const elements = [...document.querySelectorAll(selector)];
	const element = Array.from(elements || []);
	if(element.length === 0) throw new Error(`timeTracking component requires an element with attribute '${selector}'.`);
	return element;
}

function getChildSelector(parent, selector){
	return parent.map((p, i) => {
		const el = p.querySelector(selector);
		if (!el) throw new Error(`Missing element "${selector}" inside parent at index ${i}.`);
		return el;
	});
}

document.addEventListener('DOMContentLoaded', async function(){
	const defaultTimeTracking = 'weekly';
	const btnController = getSelectorAll('[data-controller-btn]');
	const displayParentEL = getSelectorAll('[data-display-time]');
	const timeTracking = new TimeTracking({
		currentEl: getChildSelector(displayParentEL, '[data-display-time-current]'),
		previousEl: getChildSelector(displayParentEL, '[data-display-time-previous]'),
	});

	timeTracking.data = await fetchData("data.json");
	timeTracking.select(defaultTimeTracking);
	btnController.forEach((btn) => {
		btn.id === defaultTimeTracking
			? btn.classList.add("active")
			: btn.classList.remove("active");

		btn.addEventListener("click", ()=>{
			timeTracking.select(btn.id);
			btnController.forEach(item => item.classList.remove('active'));
			btn.classList.add('active');
		});
	});
});