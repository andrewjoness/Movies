var html={
    currentPage:window.location.pathname,
    search:{
        term:'',
        page:1,
        totalPages:0,
        totalResults:0
    }
}

const api_url="https://api.themoviedb.org/3/";
const api_key="92d2a57d40ed080ea41763cc4cc99c54";

async function movieSlider(){
    let { results } = await fetchDataFromAPI('movie/now_playing');
    
    results.forEach((movie)=>{
        let div=document.createElement("div");
        div.classList.add("swiper-slide");

        div.innerHTML=`
            <a href="movieDetails.html?id=${movie.id}">
                <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}">
             </a>
        `

        document.querySelector(".swiper-wrapper").appendChild(div);
    })

    let swiper=new Swiper('.swiper',{
        spaceBetween:10,
        freeMode:false,
        loop:true,
        autoplay:{
            delay:3000,
            disableOnInteraction:false
        },
        breakpoints:{
            500:{
                slidesPerView:1,
            },
            768:{
                slidesPerView:2
            },
            1000:{
                slidesPerView:3
            },
            1200:{
                slidesPerView:4
            }
        }
    })

}

async function fetchPopularMovies(){
    let {results}= await fetchDataFromAPI('movie/popular');
    results.forEach((movie)=>{
        let div=document.createElement("div");
        div.classList.add("card")
        div.innerHTML=`
        <a href="movieDetails.html?id=${movie.id}">
            <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}">
        </a><br><br>
        <h5>${movie.title}</h5>
        <small>Release : ${movie.release_date}</small>
    `;

        document.querySelector(".popular-movies").appendChild(div);
    })
}

async function fetchMovieDetails(){
    let movieId=window.location.search.split("=")[1];
    
    let movie=await fetchDataFromAPI(`movie/${movieId}`);

    displayBackgroundImage(`${movie.backdrop_path}`);

    let div=document.createElement("div");
    div.classList.add("movie-info");
    div.innerHTML=`
        <div class="movie-img">
            <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="No image">
        </div>
        <div class="movie-description">
            <h2>${movie.title}</h2><br>
            <small><i class="fa-solid fa-star" ></i> ${movie.vote_average.toFixed(1)}/10</small><br><br>
            <div><b>Release Date :</b> ${movie.release_date}</div><br>
            <div>${movie.overview}</div><br>
            <div><b>Genres : </b>
            ${movie.genres.map((genre)=>
                `<span>${genre.name}</span>`    
            ).join(", ")}
            </div><br>
            <div><b>Production :</b>
            ${movie.production_companies.map((company)=>
                `<span>${company.name}</span>`
            ).join(", ")};
            </div><br><br>
            <a href=${movie.homepage} target="_blank">Visit Home Page</a>
        </div>
    `;

    document.querySelector(".movie-details").appendChild(div);
}

function displayBackgroundImage(bg){
    let div=document.createElement("div");
    div.style.backgroundImage=`url("https://image.tmdb.org/t/p/w500/${bg}")`;
    div.classList.add("background-image");
   
    document.querySelector(".movie-details").appendChild(div);
}


async function fetchDataFromAPI(endpoint){
    let response = await fetch(`${api_url}${endpoint}?api_key=${api_key}`);
    let data = await response.json();

    return data;
}

async function searchMovieFromAPI(){

    let response = await fetch(`${api_url}search/movie?api_key=${api_key}&query=${html.search.term}&page=${html.search.page}`);
    let data = await response.json();

    return data;
}

async function searchMovie(){
    let queryString=window.location.search;
    let urlParameters=new URLSearchParams(queryString);

    html.search.term=urlParameters.get('movie-name');


    let {results , total_pages,page,total_results}=await searchMovieFromAPI();  

    html.search.page=page;
    html.search.totalPages=total_pages;
    html.search.totalResults=total_results;

    if(results.length!==0){
        displaySearchResults(results);
    }else{
        let div=document.querySelector("#empty-string");
        div.innerText="No results found"
        div.classList.add("empty-string");

        let footer=document.querySelector("footer");
        footer.style.position="fixed";
        footer.style.bottom="0px";
    }

}

function displaySearchResults(results){
    document.querySelector(".movies-list").innerHTML='';
    document.querySelector("#pagination").innerHTML='';


    document.querySelector("section h2").innerHTML=`
    ${results.length} of ${html.search.totalResults} results found for ${html.search.term}
     `;

    results.forEach((movie)=>{
        let div=document.createElement("div");
        div.classList.add("card")
        div.innerHTML=`
        <a href="movieDetails.html?id=${movie.id}">
            ${
                movie.poster_path
                    ? `<img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}"/>`
                    : `<img src="movieimages.jpg" alt="No image"/>`
            }
        </a><br><br>
        <h5>${movie.title}</h5>
        <small>Release : ${movie.release_date}</small>
    `;
        document.querySelector(".movies-list").appendChild(div);
    })

    pagination();
}

function pagination(){
    let pageDiv=document.createElement("div");
            pageDiv.classList.add("pagination");
            pageDiv.innerHTML=`
                <button id="prev">Prev</button>
                <div id="pages">${html.search.page} of ${html.search.totalPages}</div>
                <button id="next">Next</button>
            `
            document.querySelector("#pagination").appendChild(pageDiv);

    if(html.search.page === 1){
        document.querySelector("#prev").disabled=true;
        document.querySelector("#prev").style.cursor="not-allowed";
        document.querySelector("#prev").style.backgroundColor="red";
    }
    if(html.search.page===html.search.totalPages){
        document.querySelector("#next").disabled=true;
        document.querySelector("#next").style.cursor="not-allowed";
        document.querySelector("#next").style.backgroundColor="red";
    }

    document.querySelector("#next").addEventListener('click',async ()=>{
        html.search.page++;
        let { results } = await searchMovieFromAPI();
        displaySearchResults(results);
    })

    document.querySelector("#prev").addEventListener('click',async ()=>{
        html.search.page--;
        let { results } = await searchMovieFromAPI();
        displaySearchResults(results);
    })
}

function showAlert(e){
    
    let movieName=document.querySelector("input").value;
    
    if(movieName.length===0){
        let div=document.querySelector("#empty-string");
        div.innerText="Please enter a Movie Name"
        div.classList.add("empty-string");
        e.preventDefault();
    }
}

function initial(){
    // let activeClass=document.querySelectorAll(".header nav a");

    // activeClass.forEach((link)=>{
    //     if(link.getAttribute('href')===html.currentPage){
    //         link.style.color="yellow";
    //         link.style.fontSize="20px";
    //     }
    // })


    switch(html.currentPage){
        case '/':
        case '/index.html':
        case '/Movies/index.html':
        case '/Movies/':
            movieSlider();
            fetchPopularMovies();
            break;
        case '/movieDetails.html':
        case '/Movies/movieDetails.html':
            fetchMovieDetails();
            break;
        case './search.html':
        case '/search.html': 
            searchMovie();
            break;
    }
}

window.addEventListener('DOMContentLoaded',initial);

document.querySelector("form").addEventListener("submit",showAlert);



