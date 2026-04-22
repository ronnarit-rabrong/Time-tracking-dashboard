class TimeTracking{
	constructor(timeDisplayEl){
		if(!timeDisplayEl){
			throw new Error("timeTracking component requires an element with attribute 'data-display-time'.");
		}

		const getRequired = (parent, selector) => {
			const childrenEl = parent.map(el => el.querySelector(selector));
			if(!childrenEl){
				throw new Error(`timeCurrentEl required element inside with attribute '${selector}'.`);
			}
			return childrenEl;
		}

		this.data = null;
		this.timeDisplayEl = timeDisplayEl;
		this.timeCurrentEl = getRequired(this.timeDisplayEl, '[data-display-time-current]');
		this.timePreviousEl = getRequired(this.timeDisplayEl, '[data-display-time-previous]');
	}

	#updateTime(data, index, keyItem, lastDate){
		this.timeCurrentEl[index].textContent = data[index]["timeframes"][keyItem]["current"] + "hrs";
		this.timePreviousEl[index].textContent = lastDate + " - " + " " + data[index]["timeframes"][keyItem]["previous"] + "hrs";
	}

	select(keyItem){
		for(let i = 0; i < this.data.length; i++){
			if(keyItem === "daily") this.#updateTime(this.data, i, keyItem, "Last Day");
			if(keyItem === "weekly") this.#updateTime(this.data, i, keyItem, "Last Week");
			if(keyItem === "monthly") this.#updateTime(this.data, i, keyItem, "Last Month");
		}
	}
}

async function fetchData(url){
	try {
		const response = await fetch(url);
		if(response.status === 200){
			const data = await response.json();
			return [...data];
		}
	}catch (error) {
		console.error(error);
	}
}

document.addEventListener('DOMContentLoaded', async function(){
	const btnController = document.querySelectorAll('[data-controller-btn]');
	const displayTime = document.querySelectorAll('[data-display-time]');
	const timeTracking = new TimeTracking([...displayTime]);
	const defaultTimeTracking = 'weekly';

	timeTracking.data = await fetchData("/data.json");
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