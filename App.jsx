import React, { useEffect, useMemo, useState } from "react";
import { products } from "./products";
import "./original.css";
import "./app.css";

const links = [
  ["Dashboard", "Dashboard.html", "▦"], ["Shop Products", "Products.html", "▧"],
  ["Categories", "Categories.html", "▤"], ["Orders", "Orders.html", "▣"],
  ["Favorites", "Favorites.html", "♡"], ["Customers", "Customers.html", "♙"],
  ["Payments", "Payments.html", "▤"], ["My Account", "Account.html", "◉"],
  ["My Profile", "Profile.html", "♟"], ["Settings", "Settings.html", "⚙"]
];
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const money = n => `${Number(n || 0).toLocaleString("en-US")} AFN`;
const priceOf = p => Number(String(p.price).replace(/[^0-9]/g, ""));
const pageName = () => {
  const file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const names = {"index.html":"Home","products.html":"Shop Products","categories.html":"Categories","cart.html":"Shopping Bag","favorites.html":"Favorites","login.html":"Sign In","dashboard.html":"Dashboard","orders.html":"Orders","customers.html":"Customers","payments.html":"Payments","account.html":"My Account","profile.html":"My Profile","settings.html":"Settings"};
  return names[file] || "Home";
};

function Sidebar({page, open, close}) {
  return <>
    <aside className={`sidebar ${open ? "show" : ""}`} id="sidebar">
      <button className="sidebar-close" onClick={close} aria-label="Close menu">×</button>
      <a className="brand" href="index.html"><span className="brand-mark">NB</span><span><span className="brand-name">NAZ BRAND</span><span className="brand-tag">BEAUTY · STYLE · YOU</span></span></a>
      <div className="nav-label">Main menu</div>
      <nav className="nav-list">{links.map(([label,href,icon])=><a key={label} className={page===label?"active":""} href={href}><span className="nav-icon">{icon}</span><span>{label}</span></a>)}
        <a className={page==="Home"?"active":""} href="index.html"><span className="nav-icon">⌂</span><span>Home</span></a>
      </nav>
      <div className="side-promo"><div className="question">?</div><h3>Welcome to Naz Brand</h3><p>Beauty, fashion and little things that make you feel special.</p><a href="Products.html">EXPLORE SHOP ↗</a></div>
    </aside>
    <div className={`overlay ${open?"show":""}`} onClick={close}></div>
  </>;
}

function Header({page,onToggle,search,setSearch}) {
  const [cartCount,setCartCount]=useState(read("nazCart",[]).reduce((n,x)=>n+x.qty,0));
  useEffect(()=>{const fn=()=>setCartCount(read("nazCart",[]).reduce((n,x)=>n+x.qty,0));window.addEventListener("storage",fn);return()=>window.removeEventListener("storage",fn)},[]);
  return <div className="top-card"><div className="top-line"><div><div className="crumb">⌂ / {page}</div><div className="page-title">{page==="Home"?"NAZ BRAND":page}</div></div><button className="tool-icon menu-button" onClick={onToggle} aria-label="Toggle sidebar">☰</button></div>
    <div className="header-tools"><label className="search"><span style={{fontSize:22}}>⌕</span><input type="search" placeholder="Search products..." value={search} onChange={e=>setSearch(e.target.value)} /></label><span className="header-spacer"></span><a className="tool-icon" href="Profile.html" title="My profile">●</a><a className="tool-icon cart-icon" href="Cart.html" title="Shopping bag">🛍<small>{cartCount}</small></a><a className="tool-icon" href="Settings.html" title="Settings">⚙</a></div>
  </div>;
}

function ProductCard({product:p,onFavorite,onCart,favorites}) {
  const isFav=favorites.includes(p.name);
  return <article className="product-card">
    <div className="product-image">{p.img?<img src={p.img.replace("assets/","/assets/")} alt={p.name}/>:<span className="emoji">{p.emoji||"✧"}</span>}{p.tag&&<span className="tag">{p.tag}</span>}</div>
    <h3>{p.name}</h3><p className="description">{p.description}</p>
    <div className="product-bottom"><span className="price">{p.price}</span><button className={`tool-icon ${isFav?"is-fav":""}`} onClick={()=>onFavorite(p.name)} aria-label="Toggle favorite">{isFav?"♥":"♡"}</button></div>
    <div className="product-bottom"><span className="tag gray">{p.category.replace(/^./,c=>c.toUpperCase())}</span><button className="button small" onClick={()=>onCart(p)}>ADD TO BAG</button></div>
  </article>;
}

function ProductGrid({items,onFavorite,onCart,favorites}) {
  return items.length ? <div className="product-grid">{items.map(p=><ProductCard key={p.name} product={p} onFavorite={onFavorite} onCart={onCart} favorites={favorites}/>)}</div> : <div className="card empty-state"><h3>No products found</h3><p>Try another search or category.</p><a className="button" href="Products.html">Browse products</a></div>;
}

function Home({items,...props}) {
 return <section className="content">
  <div className="card hero-card"><div className="hero-copy"><span className="tag">NEW COLLECTION</span><h1>A little beauty.<br/>A lot of you.</h1><p className="subtitle">Discover cosmetics, bags, perfume and accessories that bring your style together.</p><div className="form-actions"><a className="button" href="Products.html">SHOP THE COLLECTION ↗</a><a className="button light" href="Categories.html">BROWSE CATEGORIES</a></div></div><div className="hero-art"><img src="/assets/bags.jpg" alt="Naz Brand collection"/></div></div>
  <div className="section-title"><h2>Shop by Category</h2><a href="Categories.html">VIEW ALL ↗</a></div>
  <div className="grid-3">{[["💄","Cosmetics","Beauty essentials"],["👜","Bags","Everyday elegance"],["✧","Accessories","Finishing touches"]].map(([icon,name,desc])=><a key={name} className="card category-card" href={`Products.html?category=${name}`}><div className="category-icon">{icon}</div><div><h3>{name}</h3><p>{desc}</p><span className="category-link">EXPLORE ↗</span></div></a>)}</div>
  <div className="section-title"><h2>Featured Picks</h2><a href="Products.html">SHOP ALL ↗</a></div><ProductGrid items={items.slice(0,3)} {...props}/>
 </section>
}

function ProductsPage({items,...props}) {
 const [category,setCategory]=useState(new URLSearchParams(location.search).get("category")||"all");
 const [sort,setSort]=useState("default");
 const filtered=useMemo(()=>{let list=items.filter(p=>(category==="all"||p.category.toLowerCase()===category.toLowerCase())&&(`${p.name} ${p.description} ${p.category}`).toLowerCase().includes(props.search.toLowerCase()));if(sort==="low")list.sort((a,b)=>priceOf(a)-priceOf(b));if(sort==="high")list.sort((a,b)=>priceOf(b)-priceOf(a));return list},[items,category,sort,props.search]);
 return <section className="content"><div className="intro"><h1>Find something lovely</h1><p className="subtitle">Explore the Naz Brand collection of cosmetics, bags, perfume and accessories.</p></div><div className="search-row"><label className="search"><span>⌕</span><input value={props.search} onChange={e=>props.setSearch(e.target.value)} placeholder="Search products..."/></label><select className="select" value={category} onChange={e=>setCategory(e.target.value)}><option value="all">All categories</option>{["cosmetics","bags","perfume","accessories","gift sets"].map(x=><option key={x} value={x}>{x.replace(/^./,c=>c.toUpperCase())}</option>)}</select><select className="select" value={sort} onChange={e=>setSort(e.target.value)}><option value="default">Sort: Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div><ProductGrid items={filtered} {...props}/></section>
}

function CategoriesPage({items,...props}) {
 const categories=[["💄","Cosmetics","Beauty and makeup essentials","cosmetics"],["👜","Bags","Everyday and occasion bags","bags"],["♧","Perfume","Memorable fragrances","perfume"],["✧","Accessories","Jewelry and finishing touches","accessories"],["🎁","Gift Sets","Ready-to-gift collections","gift sets"]];
 return <section className="content"><div className="intro"><h1>Shop by Category</h1><p className="subtitle">Choose a collection and find pieces that fit your style.</p></div><div className="grid-3">{categories.map(([icon,name,desc,cat])=><a className="card category-card" href={`Products.html?category=${encodeURIComponent(cat)}`} key={cat}><div className="category-icon">{icon}</div><div><h3>{name}</h3><p>{desc}</p><span className="category-link">VIEW PRODUCTS ↗</span></div></a>)}</div><div className="section-title"><h2>Popular this week</h2><a href="Products.html">BROWSE SHOP ↗</a></div><ProductGrid items={items.slice(0,3)} {...props}/></section>;
}

function CartPage({cart,setCart}) {
 const total=cart.reduce((n,x)=>n+x.price*x.qty,0);
 const change=(name,delta)=>{const next=cart.map(x=>x.name===name?{...x,qty:x.qty+delta}:x).filter(x=>x.qty>0);setCart(next);write("nazCart",next)};
 return <section className="content"><div className="intro"><h1>Your Shopping Bag</h1><p className="subtitle">Review your selected items before continuing.</p></div><div className="cart-layout"><div className="card"><div className="section-title"><h2>Bag Items</h2><a href="Products.html">CONTINUE SHOPPING ↗</a></div>{cart.length===0?<div className="empty-state"><div className="empty-icon">🛍</div><h3>Your bag is empty</h3><p>Explore the collection and add something lovely.</p><a className="button" href="Products.html">SHOP PRODUCTS</a></div>:cart.map(item=><div className="cart-row" key={item.name}><div><h3>{item.name}</h3><p className="subtitle">{money(item.price)} each</p></div><div className="qty-control"><button onClick={()=>change(item.name,-1)}>-</button><span>{item.qty}</span><button onClick={()=>change(item.name,1)}>+</button></div><strong>{money(item.price*item.qty)}</strong><button className="remove-btn" onClick={()=>change(item.name,-item.qty)}>Remove</button></div>)}</div><div className="card summary"><h2>Order Summary</h2><div className="summary-line"><span>Subtotal</span><strong>{money(total)}</strong></div><div className="summary-line"><span>Delivery</span><span>To be arranged</span></div><hr/><div className="summary-line total"><span>Total</span><strong>{money(total)}</strong></div><button className="button full" disabled={!cart.length} onClick={()=>alert("Demo checkout only. No real payment is collected.")}>CONTINUE TO CHECKOUT</button><p className="fine-print">Demo checkout only. No real payment is collected.</p></div></div></section>
}

function FavoritesPage({items,...props}) {const fav=props.favorites;return <section className="content"><div className="intro"><h1>Your Favorites</h1><p className="subtitle">Keep the products you love together for later.</p></div><ProductGrid items={items.filter(p=>fav.includes(p.name))} {...props}/></section>}

function LoginPage(){const [email,setEmail]=useState("");const [password,setPassword]=useState("");return <section className="content login-layout"><div className="card login-brand"><span className="brand-mark">NB</span><h1>WELCOME TO NAZ BRAND</h1><p className="subtitle">Beauty. Style. You.</p><p>Sign in to preview your shop dashboard and manage your collections.</p><a className="button light" href="Products.html">EXPLORE SHOP</a></div><form className="card login-form" onSubmit={e=>{e.preventDefault();alert("Demo only: this form does not authenticate or protect real accounts.");}}><h2>Welcome Back</h2><p className="subtitle">Sign in to continue to your account.</p><label>Email Address<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><label>Password<input required type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password"/></label><button className="button full">SIGN IN</button><a className="text-link" href="Dashboard.html">DEMO DASHBOARD</a><p className="fine-print">Demo only: this form does not authenticate or protect real accounts.</p></form></section>}

function DashboardPage({items,...props}) {return <section className="content"><div className="intro"><h1>Welcome to Naz Brand!</h1><p className="subtitle">Your shop overview, latest orders and favourite collections in one place.</p></div><div className="cards">{[["▤","Total Sales","85,000 AFN","↑ 12% this month"],["🛍","Orders","128","8 orders need review"],["✧","Products",String(products.length),"Across 5 collections"]].map(([icon,label,value,note])=><div className="card metric" key={label}><div className="metric-icon">{icon}</div><div><p className="metric-label">{label}</p><h2>{value}</h2><p className="subtitle">{note}</p></div></div>)}</div><div className="card"><div className="section-title"><h2>Recent Orders</h2><a href="Orders.html">VIEW ALL ↗</a></div><div className="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead><tbody>{[["NB-1048","Sara Ahmad","Today","2,500 AFN","Processing"],["NB-1047","Mina Rahimi","Yesterday","1,800 AFN","Delivered"],["NB-1046","Laila Noor","9 Oct","900 AFN","Pending"]].map(row=><tr key={row[0]}>{row.map((v,i)=><td key={i}>{v}</td>)}</tr>)}</tbody></table></div></div><div className="section-title"><h2>Featured Products</h2><a href="Products.html">SEE ALL PRODUCTS ↗</a></div><ProductGrid items={items.slice(0,3)} {...props}/></section>}

function OrdersPage(){const [status,setStatus]=useState("all");const orders=[["NB-1048","Sara Ahmad","11 Oct 2026",2500,"Processing"],["NB-1047","Mina Rahimi","10 Oct 2026",1800,"Delivered"],["NB-1046","Laila Noor","09 Oct 2026",900,"Pending"],["NB-1045","Maryam Ali","08 Oct 2026",3200,"Delivered"],["NB-1044","Zahra Sadiq","07 Oct 2026",1400,"Processing"]];return <section className="content"><div className="intro"><h1>Your Orders</h1><p className="subtitle">Review your recent orders and check their current status.</p></div><div className="cards">{[["▤","All Orders","128"],["◷","Processing","12"],["✓","Delivered","104"]].map(x=><div className="card metric" key={x[1]}><div className="metric-icon">{x[0]}</div><div><p>{x[1]}</p><h2>{x[2]}</h2></div></div>)}</div><div className="card"><div className="section-title"><h2>Order History</h2><select className="select" value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All statuses</option>{["Processing","Delivered","Pending"].map(x=><option key={x}>{x}</option>)}</select></div><div className="table-wrap"><table><thead><tr>{["Order ID","Customer","Date","Total","Status","Details"].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{orders.filter(o=>status==="all"||o[4]===status).map(o=><tr key={o[0]}>{o.slice(0,4).map((v,i)=><td key={i}>{i===3?money(v):v}</td>)}<td><span className="status">{o[4]}</span></td><td><button className="button small" onClick={()=>alert(`Demo order ${o[0]}: ${o[4]}`)}>VIEW</button></td></tr>)}</tbody></table></div></div></section>}

function CustomersPage(){const [customers,setCustomers]=useState(read("nazCustomers",[{name:"Sara Ahmad",email:"sara@example.com",phone:"0700 000 001",orders:5,type:"Returning"},{name:"Mina Rahimi",email:"mina@example.com",phone:"0700 000 002",orders:3,type:"Returning"},{name:"Laila Noor",email:"laila@example.com",phone:"0700 000 003",orders:1,type:"New"}]));const [name,setName]=useState("");const [phone,setPhone]=useState("");const [email,setEmail]=useState("");return <section className="content"><div className="intro"><h1>Customer List</h1><p className="subtitle">Manage customer details for your Naz Brand shop.</p></div><div className="cards">{[["♙","Total Customers","342"],["✚","New This Month","28"],["♡","Returning Customers","64%"]].map(x=><div className="card metric" key={x[1]}><div className="metric-icon">{x[0]}</div><div><p>{x[1]}</p><h2>{x[2]}</h2></div></div>)}</div><form className="card form-card" onSubmit={e=>{e.preventDefault();const next=[{name,email,phone,orders:0,type:"New"},...customers];setCustomers(next);write("nazCustomers",next);setName("");setPhone("");setEmail("");}}><h2>Add Customer</h2><div className="form-grid"><label>Full Name<input required value={name} onChange={e=>setName(e.target.value)}/></label><label>Phone Number<input required value={phone} onChange={e=>setPhone(e.target.value)}/></label><label>Email (optional)<input type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><button className="button">ADD CUSTOMER</button></div><p className="fine-print">This demo stores new entries only in the current browser. Connect a secure backend before storing real customer data.</p></form><div className="card"><h2>Recent Customers</h2><div className="table-wrap"><table><thead><tr>{["Name","Email","Phone","Orders","Type"].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{customers.map((c,i)=><tr key={c.email+i}>{[c.name,c.email||"—",c.phone,c.orders,c.type].map((x,j)=><td key={j}>{x}</td>)}</tr>)}</tbody></table></div></div></section>}

function SimplePage({page}) {
 const [saved,setSaved]=useState(false);
 if(page==="Profile") return <section className="content"><div className="intro"><h1>Build Your Profile</h1><p className="subtitle">Keep your contact details and shop information up to date.</p></div><form className="card form-card" onSubmit={e=>{e.preventDefault();setSaved(true)}}><div className="profile-preview"><span className="brand-mark">NB</span><div><h2>Naz Brand</h2><p>Shop Owner · Beauty · Style · You</p></div></div><div className="form-grid">{["First Name","Last Name","Email Address","Phone Number","Birth Date (optional)"].map((x,i)=><label key={x}>{x}<input type={i===2?"email":i===4?"date":"text"} /></label>)}<label>Account Role<select className="select"><option>Shop Owner</option><option>Shop Manager</option><option>Customer</option></select></label><label className="span-two">About the Shop<textarea defaultValue="Beauty, fashion and little things that make you feel special." rows="3"/></label></div><div className="form-actions"><button className="button">SAVE PROFILE</button><a className="button light" href="Account.html">BACK TO ACCOUNT</a></div>{saved&&<p className="success">Profile saved in this demo view.</p>}</form></section>;
 if(page==="Settings") return <section className="content"><div className="intro"><h1>Shop Settings</h1><p className="subtitle">Personalize the basic appearance and contact information for Naz Brand.</p></div><form className="card form-card" onSubmit={e=>{e.preventDefault();setSaved(true)}}><h2>Shop Information</h2><div className="form-grid"><label>Shop Name<input defaultValue="Naz Brand"/></label><label>Contact Email<input type="email" placeholder="shop@example.com"/></label><label>Currency<select className="select"><option>AFN</option><option>USD</option><option>PKR</option></select></label><label className="span-two">Shop Description<textarea defaultValue="Beauty · Style · You" rows="3"/></label></div><button className="button">SAVE SETTINGS</button>{saved&&<p className="success">Settings saved for this demo.</p>}<div className="settings-note"><h2>Appearance</h2><p>The layout uses soft white cards, pale backgrounds and pink accents with Naz Brand's gold and black identity.</p><p><b>Layout:</b> Responsive · Sidebar Hide / Show</p><p className="fine-print">Settings in this front-end demo are saved only in the current browser. A backend is needed to sync them across devices.</p></div><a className="button light" href="Dashboard.html">BACK TO DASHBOARD</a></form></section>;
 if(page==="Payments") return <section className="content"><div className="intro"><h1>Payments & Transactions</h1><p className="subtitle">A clear overview of shop payments, saved methods and recent transactions.</p></div><div className="cards"><div className="card payment-card"><p>NAZ BRAND · Payment Card</p><h2>•••• •••• •••• 7852</h2><p>Card Holder · NAZ BRAND</p></div><div className="card metric"><div className="metric-icon">▤</div><div><p>Account Balance</p><h2>85,000 AFN</h2><p className="subtitle">Sample shop balance</p></div></div></div><div className="card"><h2>Payment Methods</h2><div className="payment-method"><b>MC</b><span>•••• •••• •••• 7852<br/><small>Mastercard · Demo</small></span><button className="button light" onClick={()=>alert("Demo payment method")}>EDIT</button></div><div className="payment-method"><b>VISA</b><span>•••• •••• •••• 5248<br/><small>Visa · Demo</small></span><button className="button light" onClick={()=>alert("Demo payment method")}>EDIT</button></div><p className="fine-print">These are sample card details only. Do not enter real payment-card information into this demo.</p></div><div className="card"><h2>Recent Transactions</h2>{[["Cosmetics order","11 Oct 2026","− 2,500 AFN"],["Customer payment","10 Oct 2026","+ 1,800 AFN"],["Accessories order","09 Oct 2026","+ 900 AFN"],["Bag order","08 Oct 2026","+ 3,200 AFN"]].map(x=><div className="activity-row" key={x[0]}><span>{x[0]}<small>{x[1]}</small></span><b>{x[2]}</b></div>)}</div></section>;
 if(page==="Account") return <section className="content"><div className="intro"><h1>My Account</h1><p className="subtitle">Your Naz Brand account overview and payment summary.</p></div><div className="cards"><div className="card metric"><div className="metric-icon">⌁</div><div><p>Account Holder</p><h2>Naz Brand</h2><p className="subtitle">Shop Owner · Member Since 2026</p></div></div><div className="card metric"><div className="metric-icon">▤</div><div><p>Account Balance</p><h2>85,000 AFN</h2><p className="subtitle">Demo account overview</p></div></div></div><div className="card"><div className="section-title"><h2>Account Details</h2><a href="Profile.html">EDIT PROFILE ↗</a></div><div className="detail-grid"><p><small>Account Name</small><b>Naz Brand</b></p><p><small>Account Type</small><b>Shop Owner</b></p><p><small>Currency</small><b>AFN</b></p><p><small>Status</small><b>Active demo</b></p></div></div><div className="card"><div className="section-title"><h2>Recent Activity</h2><a href="Orders.html">SEE ORDERS ↗</a></div><div className="activity-row"><span>Cosmetics order<small>11 Oct 2026, 12:30 PM</small></span><b>− 2,500 AFN</b></div><div className="activity-row"><span>Payment received<small>10 Oct 2026, 04:30 PM</small></span><b>+ 2,000 AFN</b></div></div></section>;
 return <section className="content"><div className="intro"><h1>{page}</h1><p className="subtitle">Welcome to Naz Brand.</p></div><div className="card"><h2>{page}</h2><p className="subtitle">This page is part of the Naz Brand React demo.</p></div></section>;
}

export default function App(){
 const page=pageName();
 const [sidebarOpen,setSidebarOpen]=useState(false);
 const [search,setSearch]=useState("");
 const [cart,setCart]=useState(()=>read("nazCart",[]));
 const [favorites,setFavorites]=useState(()=>read("nazFavorites",[]));
 useEffect(()=>{document.title=`NAZ BRAND | ${page}`},[page]);
 const toggleFavorite=name=>{const next=favorites.includes(name)?favorites.filter(x=>x!==name):[...favorites,name];setFavorites(next);write("nazFavorites",next)};
 const addCart=p=>{const next=[...cart];const item=next.find(x=>x.name===p.name);if(item)item.qty++;else next.push({name:p.name,price:priceOf(p),qty:1});setCart(next);write("nazCart",next)};
 const props={onFavorite:toggleFavorite,onCart:addCart,favorites};
 const q=search.toLowerCase().trim();
 const searched=products.filter(p=>`${p.name} ${p.description} ${p.category}`.toLowerCase().includes(q));
 let body;
 switch(page){
  case "Home": body=<Home items={searched} {...props}/>;break;
  case "Shop Products": body=<ProductsPage items={products} {...props} search={search} setSearch={setSearch}/>;break;
  case "Categories": body=<CategoriesPage items={searched} {...props}/>;break;
  case "Shopping Bag": body=<CartPage cart={cart} setCart={setCart}/>;break;
  case "Favorites": body=<FavoritesPage items={products} {...props}/>;break;
  case "Sign In": body=<LoginPage/>;break;
  case "Dashboard": body=<DashboardPage items={searched} {...props}/>;break;
  case "Orders": body=<OrdersPage/>;break;
  case "Customers": body=<CustomersPage/>;break;
  default: body=<SimplePage page={page.replace("My ","")}/>;
 }
 return <div className="layout"><Sidebar page={page} open={sidebarOpen} close={()=>setSidebarOpen(false)}/><main><Header page={page} onToggle={()=>setSidebarOpen(x=>!x)} search={search} setSearch={setSearch}/>{body}<footer className="site-footer">© 2026 NAZ BRAND · Beauty · Style · You</footer></main></div>;
}
