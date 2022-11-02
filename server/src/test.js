const a = {
	name: "cacca",
	age: 12,
    toJSON() {
        const cp = {...this};
        delete cp.age;
        return cp;
    }
};


console.log(JSON.stringify(a));
