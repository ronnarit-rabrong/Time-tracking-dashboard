class TimeTracking{
	constructor(timeDisplayEl){
		const parentElement = Array.from(timeDisplayEl || [])
		if(parentElement.length === 0){
			throw new Error("timeTracking component requires an element with attribute 'data-display-time'.");
		}

		const getChildEl = (parent, selector) => {
			return parent.map((p, i) => {
				const el = p.querySelector(selector);
				if (!el) {
					throw new Error(`Missing element "${selector}" inside parent at index ${i}.`);
				}

				return el;
			});
		}

		this.data = null;
		this.timeDisplayEl = parentElement;
		this.timeCurrentEl = getChildEl(this.timeDisplayEl, '[data-display-time-current]');
		this.timePreviousEl = getChildEl(this.timeDisplayEl, '[data-display-time-previous]');
	}

	#updateTime(data, index, keyItem, lastDate){
		this.timeCurrentEl[index].textContent = data[index]["timeframes"][keyItem]["current"] + "hrs";
		this.timePreviousEl[index].textContent = lastDate + " - " + " " + data[index]["timeframes"][keyItem]["previous"] + "hrs";
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

document.addEventListener('DOMContentLoaded', async function(){
	const btnController = document.querySelectorAll('[data-controller-btn]');
	const displayTime = document.querySelectorAll('[data-display-time]');
	const timeTracking = new TimeTracking([...displayTime]);
	const defaultTimeTracking = 'weekly';

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