export default function App() {
    async function getMovie() {
        let url = `https://www.omdbapi.com/?t=${"Fast+%26+Furious"}&apikey=83650d26`;
        const req = await fetch(url);
        const res = await req.json();
        console.log(res);
    }
    getMovie();
    return <h1>Hello</h1>;
}
