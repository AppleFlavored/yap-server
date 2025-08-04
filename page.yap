p("Hello! This is a demonstration of a browser and protocol made from scratch. Because of the custom network protocol that is used, the browser is not compatible with the World Wide Web.")
p("")

p("This project is made up of four different parts:")
p(" • the protocol which is used by the browser and the server to communicate with one another;")
p(" • the browser which displays documents sent by a server;")
p(" • the server which sends documents to the browser;")
p(" • and a markup language (that will later become a scripting language) to create documents.")
p("")

p("The original goal of this project is to create a content-first browser that is privacy respecting. Therefore, there are some things that are purposely missing like cookies.")
p("")

p("Here are screenshots:")
row {
    img(src: "internal:///images/demo1.png")
    img(src: "internal:///images/demo2.png")
}

p("A link to the source code (with a QR code!)")
p("https://github.com/AppleFlavored/yap")
img(src: "internal:///images/qrcode2repo.png")
